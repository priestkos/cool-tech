import { describe, expect, test } from "bun:test"
import {
  defaultAppState,
  parsePersistedJson,
  serializeAppState,
  STORAGE_KEY,
} from "./app-state"

describe("URL/local state round-trip", () => {
  test("bad input never throws and falls back to defaults", () => {
    expect(parsePersistedJson(null)).toBeNull()
    expect(parsePersistedJson("")).toBeNull()
    expect(parsePersistedJson("{not json")).toBeNull()
    const broken = parsePersistedJson(JSON.stringify({ v: 2 }))
    expect(broken).toBeNull()
    const coerced = parsePersistedJson(
      JSON.stringify({
        v: 1,
        simulate: true,
        pinned: { a1: "nope" },
        explorer: { look: "fake-look", shape: "triangle" },
      }),
    )
    expect(coerced?.pinned.a1).toBe("idle")
    expect(coerced?.explorer.look).toBe("auto")
  })

  test("serialize and parse preserves core fields", () => {
    const state = defaultAppState()
    state.simulate = true
    state.tick = 12
    state.explorer.rawInput = "42"
    state.explorer.seedMode = "number"
    const round = parsePersistedJson(serializeAppState(state))
    expect(round?.simulate).toBe(true)
    expect(round?.tick).toBe(12)
    expect(round?.explorer.rawInput).toBe("42")
    expect(round?.explorer.seedMode).toBe("number")
    expect(STORAGE_KEY).toContain("glorpies")
  })
})
