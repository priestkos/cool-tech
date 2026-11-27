import {
  corruptBytes,
  demonstrateSuspendBlocked,
  executeCode,
  executePreset,
  forkSnapshot,
  resumeBytes,
  runEscapeProbes,
  startSuspendableSession,
  suspendSession,
  tryResumeCorrupt,
} from "../lib/lab-runner.ts"
import { presetById } from "../lib/presets.ts"
import type { PresetId, WeatherProfile } from "../lib/types.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function decodeBytes(base64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(base64, "base64"))
}

export async function handleLabRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const url = new URL(req.url)

  if (url.pathname === "/api/health" && req.method === "GET") {
    return json({ ok: true, pid: process.pid, label: "parent Bun server" })
  }

  if (url.pathname === "/api/run" && req.method === "POST") {
    const body = (await req.json()) as { code?: string; presetId?: PresetId; profile?: WeatherProfile }
    if (body.presetId) {
      return json(await executePreset(body.presetId, body.profile ?? "sunny"))
    }
    if (!body.code) return json({ error: "code or presetId required" }, 400)
    return json(await executeCode(body.code, body.profile ?? "sunny", false))
  }

  if (url.pathname === "/api/session/start" && req.method === "POST") {
    const body = (await req.json()) as { presetId?: PresetId; code?: string }
    const code = body.code ?? (body.presetId ? presetById(body.presetId).code : "")
    if (!code) return json({ error: "code or presetId required" }, 400)
    const session = startSuspendableSession(code)
    return json({ sessionId: session.id, pid: process.pid, processLabel: "parent Bun server" })
  }

  if (url.pathname === "/api/session/suspend" && req.method === "POST") {
    const body = (await req.json()) as { sessionId?: string }
    if (!body.sessionId) return json({ error: "sessionId required" }, 400)
    return json(await suspendSession(body.sessionId))
  }

  if (url.pathname === "/api/resume" && req.method === "POST") {
    const body = (await req.json()) as { bytesBase64?: string; profile?: WeatherProfile }
    if (!body.bytesBase64) return json({ error: "bytesBase64 required" }, 400)
    const bytes = decodeBytes(body.bytesBase64)
    const result = await resumeBytes(bytes, body.profile ?? "sunny", "parent Bun server (resume)")
    return json(result)
  }

  if (url.pathname === "/api/resume-child" && req.method === "POST") {
    const body = (await req.json()) as { bytesBase64?: string; profile?: WeatherProfile }
    if (!body.bytesBase64) return json({ error: "bytesBase64 required" }, 400)
    const proc = Bun.spawn(
      ["bun", "scripts/resume-child.ts"],
      {
        cwd: import.meta.dir + "/..",
        stdin: "pipe",
        stdout: "pipe",
        stderr: "pipe",
        env: { ...process.env },
      },
    )
    proc.stdin?.write(
      JSON.stringify({ bytesBase64: body.bytesBase64, profile: body.profile ?? "sunny" }),
    )
    proc.stdin?.end()
    const [stdout, stderr, exitCode] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
      proc.exited,
    ])
    if (exitCode !== 0) {
      return json({ error: "child failed", stderr, stdout }, 500)
    }
    try {
      return json(JSON.parse(stdout.trim()))
    } catch {
      return json({ error: "invalid child json", stdout, stderr }, 500)
    }
  }

  if (url.pathname === "/api/fork" && req.method === "POST") {
    const body = (await req.json()) as {
      bytesBase64?: string
      leftProfile?: WeatherProfile
      rightProfile?: WeatherProfile
    }
    if (!body.bytesBase64) return json({ error: "bytesBase64 required" }, 400)
    const bytes = decodeBytes(body.bytesBase64)
    return json(
      await forkSnapshot(bytes, body.leftProfile ?? "sunny", body.rightProfile ?? "rainy"),
    )
  }

  if (url.pathname === "/api/snapshot/corrupt" && req.method === "POST") {
    const body = (await req.json()) as { bytesBase64?: string }
    if (!body.bytesBase64) return json({ error: "bytesBase64 required" }, 400)
    const bytes = decodeBytes(body.bytesBase64)
    return json(tryResumeCorrupt(corruptBytes(bytes)))
  }

  if (url.pathname === "/api/demo/suspend-blocked" && req.method === "POST") {
    return json(await demonstrateSuspendBlocked())
  }

  if (url.pathname === "/api/escape" && req.method === "POST") {
    return json({ probes: await runEscapeProbes() })
  }

  return json({ error: "Not found" }, 404)
}
