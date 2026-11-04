import { describe, expect, test } from "bun:test"

import {
  defaultAppState,
  parseAppState,
  serializeAppState,
  toggleSketchMode,
} from "./app-state"

describe("app state URL round-trip", () => {
  test("defaults when search empty", () => {
    expect(parseAppState("")).toEqual(defaultAppState())
  })

  test("round-trips non-default fields", () => {
    const state = {
      view: "flip" as const,
      screen: "dashboard" as const,
      theme: "dark" as const,
      flipKit: "sketch" as const,
    }
    const qs = serializeAppState(state)
    expect(parseAppState(qs)).toEqual(state)
  })

  test("sketch toggle in flip mode alternates kit", () => {
    const start = { ...defaultAppState(), view: "flip" as const, flipKit: "plain" as const }
    const next = toggleSketchMode(start)
    expect(next.flipKit).toBe("sketch")
    expect(toggleSketchMode(next).flipKit).toBe("plain")
  })
})
