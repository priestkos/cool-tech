import { describe, expect, test } from "bun:test"
import { DEFAULT_PREFERENCES } from "./types.ts"
import { buildSpec, specToJsonDeterministic } from "./spec.ts"

describe("spec export", () => {
  test("settings fixture lists both libraries", () => {
    const spec = buildSpec("settings", DEFAULT_PREFERENCES)
    expect(spec.astryx.components.some((c) => c.name === "Switch")).toBe(true)
    expect(spec.shadcn.components.some((c) => c.name === "Switch")).toBe(true)
  })

  test("JSON export is valid and marked illustrative", () => {
    const raw = specToJsonDeterministic("dashboard", DEFAULT_PREFERENCES)
    const parsed = JSON.parse(raw) as {
      illustrative: boolean
      entries: unknown[]
    }
    expect(parsed.illustrative).toBe(true)
    expect(parsed.entries).toHaveLength(2)
  })

  test("preferences changes reflect in astryx switch prop", () => {
    const off = buildSpec("settings", {
      ...DEFAULT_PREFERENCES,
      notifications: false,
    })
    const sw = off.astryx.components.find((c) => c.name === "Switch")
    expect(sw?.props.value).toBe("false")
  })
})
