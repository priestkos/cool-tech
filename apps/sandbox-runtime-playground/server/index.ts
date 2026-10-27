import type { PresetId, SrtSettings } from "../lib/types.ts"
import { getSrtStatus, runPreset } from "./srt-runner.ts"

const port = Number(process.env.SRT_PLAYGROUND_API_PORT ?? "3922")

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

Bun.serve({
  port,
  async fetch(req) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const url = new URL(req.url)

    if (url.pathname === "/api/status" && req.method === "GET") {
      const status = await getSrtStatus()
      return json(status)
    }

    if (url.pathname === "/api/run" && req.method === "POST") {
      let body: {
        presetId?: PresetId
        settings?: SrtSettings
        useReal?: boolean
      }
      try {
        body = await req.json()
      } catch {
        return json({ error: "Invalid JSON" }, 400)
      }

      const { presetId, settings, useReal } = body
      if (!presetId || !settings) {
        return json({ error: "presetId and settings required" }, 400)
      }

      const status = await getSrtStatus()
      const real = Boolean(useReal) && status.usable
      const result = await runPreset(presetId, settings, real)
      return json(result)
    }

    return json({ error: "Not found" }, 404)
  },
})

console.log(`[sandbox-runtime-playground] API on http://localhost:${port}`)
