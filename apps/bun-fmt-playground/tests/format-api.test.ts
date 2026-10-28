import { describe, expect, test } from "bun:test"
import { bunVersionAtLeast } from "../lib/bun-version.ts"
import { runFormat } from "../server/format-runner.ts"

describe("runFormat", () => {
  test.skipIf(!bunVersionAtLeast(Bun.version, "1.4.4"))(
    "formats TS with --no-semi via API logic",
    async () => {
      const result = await runFormat("ts", "const x=1;", { semi: false })
      expect("error" in result && !("formatted" in result)).toBe(false)
      if ("formatted" in result) {
        expect(result.formatted).toContain("const x = 1")
        expect(result.changed).toBe(true)
        expect(result.elapsedMs).toBeGreaterThan(0)
      }
    },
  )
})

describe("POST /api/format", () => {
  test.skipIf(!bunVersionAtLeast(Bun.version, "1.4.4"))(
    "end-to-end through Bun.serve handler",
    async () => {
      const port = 3955
      const server = Bun.spawn(["bun", "server/index.ts"], {
        cwd: import.meta.dir + "/..",
        env: { ...process.env, BUN_FMT_API_PORT: String(port) },
        stdout: "pipe",
        stderr: "pipe",
      })

      await Bun.sleep(300)

      try {
        const res = await fetch(`http://127.0.0.1:${port}/api/format`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: "ts",
            code: "const y=2;",
            options: { semi: false },
          }),
        })
        const data = await res.json()
        expect(res.ok).toBe(true)
        expect(data.formatted).toContain("const y = 2")
        expect(data.changed).toBe(true)
      } finally {
        server.kill()
        await server.exited
      }
    },
  )
})
