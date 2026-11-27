import type { RunResultPayload } from "./types.ts"

export async function spawnResumeChild(bytesBase64: string, profile: "sunny" | "rainy") {
  const proc = Bun.spawn(["bun", "scripts/resume-child.ts"], {
    cwd: import.meta.dir + "/..",
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  })
  proc.stdin?.write(JSON.stringify({ bytesBase64, profile }))
  proc.stdin?.end()
  const [stdout, exit] = await Promise.all([new Response(proc.stdout).text(), proc.exited])
  if (exit !== 0) {
    const stderr = await new Response(proc.stderr).text()
    throw new Error(`child exit ${exit}: ${stderr}`)
  }
  return JSON.parse(stdout.trim()) as RunResultPayload
}