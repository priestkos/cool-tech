import { describe, expect, test } from "bun:test"
import {
  DEFAULTS,
  GLASS,
  LIQUID,
  SHOTS,
  UPSTREAM_PIN,
  clamp,
  clampBottleState,
  dimensionReadout,
  exposureEvLabel,
  formatMillimetres,
  mergeBottleState,
  prof,
  resetBottleState,
  shotById,
} from "./bottle-studio-api"

describe("bottle-studio upstream API", () => {
  test("pin metadata matches vendored source", () => {
    expect(UPSTREAM_PIN.commit).toBe("de876d4fb2bd3a37654647d4c585170237fe4123")
    expect(UPSTREAM_PIN.tag).toBe("v1.0.0")
    expect(UPSTREAM_PIN.license).toBe("MIT")
  })

  test("clamp mirrors upstream bounds", () => {
    expect(clamp(5, 0, 3)).toBe(3)
    const wide = clampBottleState({ ...DEFAULTS, R: 9, fill: 2, bdTitle: "x".repeat(40) })
    expect(wide.R).toBe(0.66)
    expect(wide.fill).toBe(1)
    expect(wide.bdTitle.length).toBe(28)
  })

  test("preset tables match upstream keys", () => {
    expect(Object.keys(GLASS)).toEqual([
      "ember",
      "smoke",
      "flint",
      "emerald",
      "cobalt",
    ])
    expect(LIQUID.empty.name).toBe("Empty")
    expect(SHOTS).toHaveLength(6)
    expect(shotById("hero")?.mm).toBe(85)
  })

  test("prof and readouts follow upstream geometry", () => {
    const atShoulder = prof(1.0, DEFAULTS)
    expect(atShoulder[0]).toBeGreaterThan(0.2)
    expect(atShoulder[0]).toBeLessThan(1)
    expect(dimensionReadout(DEFAULTS)).toMatch(/H \d+ · W \d+ mm/)
    expect(formatMillimetres(DEFAULTS.R)).toBe("56 mm")
  })

  test("merge, reset, and exposure label", () => {
    const merged = mergeBottleState(DEFAULTS, { fill: 0.42, glass: "cobalt" })
    expect(merged.fill).toBe(0.42)
    expect(merged.glass).toBe("cobalt")
    expect(resetBottleState()).toEqual(DEFAULTS)
    expect(exposureEvLabel(1)).toBe("+0.0 EV")
    expect(exposureEvLabel(0.5)).toBe("-1.0 EV")
  })
})