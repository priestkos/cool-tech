import { describe, expect, test } from "bun:test"
import {
  corruptBytes,
  dropSession,
  executeCode,
  executePreset,
  getSession,
  runEscapeProbes,
  startSuspendableSession,
  suspendResumeRoundTrip,
  suspendSession,
  tryResumeCorrupt,
} from "./lab-runner.ts"
import { presetById } from "./presets.ts"
import type { PresetId } from "./types.ts"

describe("psychoscript lab edges", () => {
  test("globalThis probe stays off the host", async () => {
    delete (globalThis as { __pwned?: unknown }).__pwned
    const probes = await runEscapeProbes()
    const row = probes.find((probe) => probe.id === "globalThis")
    expect(row).toBeDefined()
    expect((globalThis as { __pwned?: unknown }).__pwned).toBeUndefined()
  })

  test("host-error preset returns CityNotFound with suggestions", async () => {
    const result = await executePreset("host-error")
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe("CityNotFound")
    expect(result.error.suggestions).toContain("Paris")
    expect(result.error.suggestions).toContain("Oslo")
    expect(result.error.suggestions).toContain("Tokyo")
    const weatherCall = result.toolCalls.find((entry) => entry.name === "weather.get")
    expect(weatherCall?.error?.kind).toBe("CityNotFound")
  })

  test("todo.done on a missing id is NotFound", async () => {
    const result = await executeCode(`return await todo.done(1);`)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe("NotFound")
  })

  test("todo.done coerces a string id to a number", async () => {
    const result = await executeCode(`
      await todo.add("umbrella");
      return await todo.done("1");
    `)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const row = result.value as { id: number; done: boolean }
    expect(row.id).toBe(1)
    expect(row.done).toBe(true)
  })

  test("todo.done of a non-numeric id is NotFound", async () => {
    const result = await executeCode(`return await todo.done("nope");`)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.kind).toBe("NotFound")
  })

  test("weather.get normalizes city casing for each profile", async () => {
    const sunny = await executeCode(`return await weather.get("pArIs");`, "sunny")
    expect(sunny.ok).toBe(true)
    if (sunny.ok) {
      const value = sunny.value as { city: string; tempC: number; conditions: string }
      expect(value.city).toBe("Paris")
      expect(value.tempC).toBe(22)
      expect(value.conditions).toBe("clear")
    }

    const rainy = await executeCode(`return await weather.get("pArIs");`, "rainy")
    expect(rainy.ok).toBe(true)
    if (rainy.ok) {
      const value = rainy.value as { city: string; tempC: number; conditions: string; summary: string }
      expect(value.city).toBe("Paris")
      expect(value.tempC).toBe(11)
      expect(value.conditions).toBe("rain")
      expect(value.summary).toContain("Rain")
    }
  })

  test("search.query matches one title, falls back, and treats forecast as a hit", async () => {
    const psychoscript = await executeCode(`return await search.query("psychoscript");`)
    expect(psychoscript.ok).toBe(true)
    if (psychoscript.ok) {
      const hits = psychoscript.value as Array<{ title: string }>
      expect(hits).toHaveLength(1)
      expect(hits[0]?.title).toBe("Psychoscript docs")
    }

    const missing = await executeCode(`return await search.query("zzzz-no-match");`)
    expect(missing.ok).toBe(true)
    if (missing.ok) {
      const hits = missing.value as Array<{ title: string }>
      expect(hits.map((hit) => hit.title)).toEqual(["Psychoscript docs", "OpenCode on X"])
    }

    // Neither fixture title contains "forecast". Both match because the filter ORs query.includes("forecast").
    const forecast = await executeCode(`return await search.query("forecast");`)
    expect(forecast.ok).toBe(true)
    if (forecast.ok) {
      const hits = forecast.value as Array<{ title: string }>
      expect(hits.map((hit) => hit.title)).toEqual(["Psychoscript docs", "OpenCode on X"])
    }
  })

  test("corruptBytes flips index 0 when length is at most 10", () => {
    const bytes = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    const flipped = corruptBytes(bytes)
    expect(bytes[0]).toBe(1)
    expect(flipped[0]).toBe(1 ^ 0xff)
    expect([...flipped.slice(1)]).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10])

    const tiny = Uint8Array.from([0x10, 0x20, 0x30])
    const tinyFlipped = corruptBytes(tiny)
    expect(tiny[0]).toBe(0x10)
    expect(tinyFlipped[0]).toBe(0x10 ^ 0xff)
    expect(tinyFlipped[1]).toBe(0x20)
    expect(tinyFlipped[2]).toBe(0x30)
  })

  test("corruptBytes flips index 10 only when length is greater than 10", () => {
    const bytes = new Uint8Array(16)
    bytes[0] = 0x11
    bytes[10] = 0x22
    bytes[15] = 0x33
    const flipped = corruptBytes(bytes)
    expect(bytes[0]).toBe(0x11)
    expect(bytes[10]).toBe(0x22)
    expect(flipped[0]).toBe(0x11)
    expect(flipped[10]).toBe(0x22 ^ 0xff)
    for (let i = 0; i < bytes.length; i++) {
      if (i === 10) continue
      expect(flipped[i]).toBe(bytes[i])
    }
  })

  test("a real snapshot with byte 10 flipped is a SnapshotError", async () => {
    const { bytes } = await suspendResumeRoundTrip(presetById("long-pause").code, 40)
    const parsed = tryResumeCorrupt(corruptBytes(bytes))
    expect(parsed.ok).toBe(true)
    if (parsed.ok) expect(parsed.name).toBe("SnapshotError")
  })

  test("presetById throws RangeError for an id outside the union", () => {
    const id = "not-a-preset" as PresetId
    expect(() => presetById(id)).toThrow(RangeError)
    expect(() => presetById(id)).toThrow("unknown preset")
  })

  test("suspendSession throws RangeError when the session is missing", async () => {
    await expect(suspendSession("does-not-exist")).rejects.toThrow(RangeError)
    await expect(suspendSession("does-not-exist")).rejects.toThrow("session not found")
  })

  test("dropSession then getSession is undefined", async () => {
    const session = startSuspendableSession("return 1", 80)
    expect(getSession(session.id)).toBe(session)
    dropSession(session.id)
    expect(getSession(session.id)).toBeUndefined()
    await session.running
  })

  test("suspendSession snapshots a live session and a second suspend throws", async () => {
    const session = startSuspendableSession(presetById("long-pause").code, 80)
    try {
      await Bun.sleep(15)
      const first = await suspendSession(session.id)
      expect(first.suspended).toBe(true)
      if (first.suspended) expect(first.byteLength).toBeGreaterThan(100)
      await expect(suspendSession(session.id)).rejects.toThrow(RangeError)
    } finally {
      dropSession(session.id)
    }
  })
})
