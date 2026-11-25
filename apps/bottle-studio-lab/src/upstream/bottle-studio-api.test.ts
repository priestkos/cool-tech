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

  test("clamps low and high control edges", () => {
    const low = clampBottleState({
      ...DEFAULTS,
      corner: 0,
      shoulder: 1,
      frost: -1,
      lightRot: -999,
      exposure: 0,
      reflect: 2,
      mm: 10,
      aperture: -0.2,
      bdSize: 0,
      bdY: 2,
      bdLine: "y".repeat(40),
    })
    expect(low.corner).toBe(0.12)
    expect(low.shoulder).toBe(0.68)
    expect(low.frost).toBe(0)
    expect(low.lightRot).toBe(-180)
    expect(low.exposure).toBe(0.4)
    expect(low.reflect).toBe(0.8)
    expect(low.mm).toBe(24)
    expect(low.aperture).toBe(0)
    expect(low.bdSize).toBe(0.3)
    expect(low.bdY).toBe(0.9)
    expect(low.bdLine).toHaveLength(28)

    const high = clampBottleState({
      ...DEFAULTS,
      lightRot: 999,
      exposure: 9,
      mm: 200,
      corner: 9,
      shoulder: 0,
      aperture: 5,
      bdSize: 9,
      bdY: 0,
    })
    expect(high.lightRot).toBe(180)
    expect(high.exposure).toBe(2)
    expect(high.mm).toBe(135)
    expect(high.corner).toBe(0.48)
    expect(high.shoulder).toBe(0.5)
    expect(high.aperture).toBe(1)
    expect(high.bdSize).toBe(1.4)
    expect(high.bdY).toBe(0.1)
  })

  test("profile regions keep bevel, body, and neck", () => {
    const bevel = prof(0, DEFAULTS)
    expect(bevel[0]).toBeCloseTo(0.51, 5)
    expect(bevel[1]).toBe(0)

    const body = prof(1, DEFAULTS)
    expect(body[0]).toBeCloseTo(0.5556923076923077, 5)
    expect(body[1]).toBe(0)

    const neck = prof(2.5, DEFAULTS)
    expect(neck[0]).toBeCloseTo(0.18821073717948716, 5)
    expect(neck[1]).toBe(1)
  })

  test("round bottle readout uses the circumference factor", () => {
    expect(dimensionReadout({ ...DEFAULTS, sides: 0 })).toBe("H 273 · W 90 mm")
  })
})