import { describe, expect, test } from "bun:test"
import {
  candelaToSpotIntensity,
  exitanceToEmissiveIntensity,
  EMISSIVE_REFERENCE_LM_PER_M2,
  hemisphereLuxToIntensity,
  luxToDirectionalIntensity,
  lumensToPointIntensity,
  sunDirectionFromAzimuthElevation,
} from "./physical"

describe("physical units", () => {
  test("lux maps 1:1 to directional intensity", () => {
    expect(luxToDirectionalIntensity(90_000)).toBe(90_000)
    expect(luxToDirectionalIntensity(-1)).toBe(0)
  })

  test("lumens map to point intensity", () => {
    expect(lumensToPointIntensity(1200)).toBe(1200)
  })

  test("candela map to spot intensity", () => {
    expect(candelaToSpotIntensity(45_000)).toBe(45_000)
  })

  test("emissive exitance scaling", () => {
    expect(exitanceToEmissiveIntensity(EMISSIVE_REFERENCE_LM_PER_M2)).toBe(1)
    expect(exitanceToEmissiveIntensity(500)).toBe(0.5)
  })

  test("sun at east, horizon", () => {
    const [x, y, z] = sunDirectionFromAzimuthElevation(90, 0)
    expect(x).toBeCloseTo(1, 5)
    expect(y).toBeCloseTo(0, 5)
    expect(z).toBeCloseTo(0, 5)
  })

  test("sun straight up", () => {
    const [, y] = sunDirectionFromAzimuthElevation(0, 90)
    expect(y).toBeCloseTo(1, 5)
  })

  test("clamps negative flux and scales hemisphere lux", () => {
    expect(lumensToPointIntensity(-5)).toBe(0)
    expect(candelaToSpotIntensity(-1)).toBe(0)
    expect(exitanceToEmissiveIntensity(-10)).toBe(0)
    expect(hemisphereLuxToIntensity(0)).toBe(0)
    expect(hemisphereLuxToIntensity(-20)).toBe(0)
    expect(hemisphereLuxToIntensity(10_000)).toBeCloseTo(1.5, 5)
  })

  test("sun direction at north and below the horizon", () => {
    const [x, y, z] = sunDirectionFromAzimuthElevation(0, 0)
    expect(x).toBeCloseTo(0, 5)
    expect(y).toBeCloseTo(0, 5)
    expect(z).toBeCloseTo(1, 5)

    const below = sunDirectionFromAzimuthElevation(180, -15)
    expect(below[1]).toBeLessThan(0)
  })
})