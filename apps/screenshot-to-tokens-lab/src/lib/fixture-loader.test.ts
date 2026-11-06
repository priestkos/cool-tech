import { describe, expect, test } from "bun:test"
import { getFixtureById } from "./fixtures/catalog"
import { loadFixture } from "./fixture-loader"
import { parseHashState, parsePersistedState } from "./url-state"

describe("fixture loader", () => {
  test("loads known fixture", () => {
    const fixture = loadFixture("orbit-commerce")
    expect(fixture?.title).toBe("Orbit Commerce")
  })

  test("rejects bad ids without throwing", () => {
    expect(loadFixture("not-real")).toBeNull()
    expect(loadFixture(null)).toBeNull()
  })
})

describe("url/local persisted state", () => {
  test("round-trips overrides", () => {
    const parsed = parsePersistedState(
      { fixtureId: "lumen-ops", overrides: { "mint-500": "#00ff00" }, dark: true },
      "nimbus-analytics",
    )
    expect(parsed.fixtureId).toBe("lumen-ops")
    expect(parsed.overrides["mint-500"]).toBe("#00ff00")
    expect(parsed.dark).toBe(true)
  })

  test("coerces bad hash input", () => {
    const parsed = parseHashState("#s2t=not-json", "nimbus-analytics")
    expect(parsed.fixtureId).toBe("nimbus-analytics")
    expect(parsed.overrides).toEqual({})
  })

  test("catalog fixture has rewrite examples", () => {
    const fixture = getFixtureById("nimbus-analytics")
    expect(fixture?.rewriteExamples.length).toBeGreaterThanOrEqual(2)
  })
})
