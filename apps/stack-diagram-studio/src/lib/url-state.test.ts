import { describe, expect, test } from "bun:test"
import { decodeAppState, encodeAppState } from "./url-state"

describe("url state", () => {
  test("round-trips sentence theme and positions", () => {
    const state = {
      sentence: "Bun, Hono, SQLite",
      theme: "dark" as const,
      diagramTheme: "dark" as const,
      positions: { "inst:bun": { x: 16, y: 32 } },
    }
    const hash = encodeAppState(state)
    const decoded = decodeAppState(hash)
    expect(decoded?.sentence).toBe(state.sentence)
    expect(decoded?.theme).toBe("dark")
    expect(decoded?.positions["inst:bun"]).toEqual({ x: 16, y: 32 })
  })

  test("bad hash is coerced without throwing", () => {
    expect(decodeAppState("#not-json")).toBeNull()
    expect(decodeAppState("#" + encodeURIComponent('{"s":123}'))?.sentence).toBe("")
  })
})
