import { describe, expect, test } from "bun:test"
import { SnapshotError, fromBytes, toBytes } from "psychoscript"
import { presetById } from "./presets.ts"
import {
  corruptBytes,
  demonstrateSuspendBlocked,
  executePreset,
  forkSnapshot,
  resumeBytes,
  runEscapeProbes,
  suspendResumeRoundTrip,
  tryResumeCorrupt,
} from "./lab-runner.ts"
import { spawnResumeChild } from "./test-child.ts"

describe("psychoscript lab", () => {
  test("preset chain returns expected value", async () => {
    const result = await executePreset("chain", "sunny")
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const value = result.value as Record<string, unknown>
    expect((value.weather as { city: string }).city).toBe("Paris")
    expect(result.toolCalls.length).toBeGreaterThanOrEqual(3)
  })

  test("suspend → bytes → resume matches uninterrupted run", async () => {
    const code = presetById("long-pause").code
    const { bytes, resumed, baseline } = await suspendResumeRoundTrip(code, 60)
    expect(bytes.length).toBeGreaterThan(100)
    expect("ok" in resumed && resumed.ok).toBe(true)
    expect("ok" in baseline && baseline.ok).toBe(true)
    if ("ok" in resumed && resumed.ok && "ok" in baseline && baseline.ok) {
      expect(JSON.stringify(resumed.value)).toBe(JSON.stringify(baseline.value))
    }
  })

  test("child process resume from bytes alone", async () => {
    const code = presetById("long-pause").code
    const { bytes } = await suspendResumeRoundTrip(code, 60)
    const child = await spawnResumeChild(Buffer.from(bytes).toString("base64"), "sunny")
    expect(child.processLabel).toContain("child")
    expect(child.ok).toBe(true)
  })

  test("fork with different host data yields two different results", async () => {
    const code = `const polled = await weather.poll("Berlin"); return polled;`
    const { bytes } = await suspendResumeRoundTrip(code, 40)
    const forked = await forkSnapshot(bytes, "sunny", "rainy")
    expect(forked.left.ok && forked.right.ok).toBe(true)
    if (forked.left.ok && forked.right.ok) {
      const l = forked.left.value as { conditions: string }
      const r = forked.right.value as { conditions: string }
      expect(l.conditions).toBe("clear")
      expect(r.conditions).toBe("rain")
    }
  })

  test("corrupted snapshot rejects with SnapshotError", async () => {
    const code = presetById("chain").code
    const { runtime } = await import("./host-factory.ts").then((m) => m.makeLabRuntime({ profile: "sunny" }))
    const done = await runtime.execute(code)
    expect(done.ok).toBe(true)
    const bogus = corruptBytes(new Uint8Array([123, 34, 0]))
    const parsed = tryResumeCorrupt(bogus)
    expect(parsed.ok).toBe(true)
    if (parsed.ok) expect(parsed.name).toBe("SnapshotError")
    try {
      fromBytes(bogus)
    } catch (err) {
      expect(err).toBeInstanceOf(SnapshotError)
    }
  })

  test("suspend during non-idempotent call rejects with SuspendError", async () => {
    const demo = await demonstrateSuspendBlocked(80)
    expect(demo.rejected).toBe(true)
    if (demo.rejected) {
      expect(demo.name).toBe("SuspendError")
      expect(demo.running.length).toBeGreaterThan(0)
    }
  })

  test("escape probes stay confined", async () => {
    const probes = await runEscapeProbes()
    for (const id of ["fetch", "require", "import", "setTimeout", "eval"] as const) {
      const row = probes.find((p) => p.id === id)
      expect(row?.ok).toBe(false)
    }
    const processProbe = probes.find((p) => p.id === "process")
    expect(processProbe?.ok).toBe(true)
    expect(processProbe?.value).toBe("no process")
  })

  test("resumeBytes in parent", async () => {
    const code = presetById("long-pause").code
    const { bytes } = await suspendResumeRoundTrip(code, 50)
    const resumed = await resumeBytes(bytes, "sunny", "test parent")
    expect(resumed.ok).toBe(true)
  })

  test("no external fetch in execute path", async () => {
    const original = globalThis.fetch
    let external = 0
    globalThis.fetch = ((input: RequestInfo | URL) => {
      const url = String(input)
      if (!url.includes("127.0.0.1") && !url.includes("localhost")) external += 1
      return original(input)
    }) as typeof fetch
    try {
      await executePreset("loop")
      expect(external).toBe(0)
    } finally {
      globalThis.fetch = original
    }
  })
})