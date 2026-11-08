import { describe, expect, test } from "bun:test"
import { DEFAULT_PREFERENCES } from "./types.ts"

describe("lab preferences model", () => {
  test("default preferences match fixture seed", () => {
    expect(DEFAULT_PREFERENCES.displayName).toBe("Sai")
    expect(DEFAULT_PREFERENCES.notifications).toBe(true)
    expect(DEFAULT_PREFERENCES.density).toBe("comfortable")
  })

  test("patching preferences preserves unrelated fields", () => {
    const base = { ...DEFAULT_PREFERENCES }
    const next = { ...base, notifications: false }
    expect(next.displayName).toBe(base.displayName)
    expect(next.notifications).toBe(false)
  })
})
