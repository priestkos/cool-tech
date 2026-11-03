import { describe, expect, test } from "bun:test"
import { NAMED_EASINGS, sampleCubicBezierY } from "./bezier"

describe("cubic-bezier solver", () => {
  test("matches known CSS values within 1e-3", () => {
    expect(sampleCubicBezierY(0, NAMED_EASINGS.ease)).toBeCloseTo(0, 3)
    expect(sampleCubicBezierY(1, NAMED_EASINGS.ease)).toBeCloseTo(1, 3)
    expect(sampleCubicBezierY(0.5, NAMED_EASINGS.linear)).toBeCloseTo(0.5, 3)
    expect(sampleCubicBezierY(0.25, NAMED_EASINGS["ease-in"])).toBeCloseTo(
      sampleCubicBezierY(0.25, NAMED_EASINGS["ease-in"]),
      3,
    )
    expect(
      Math.abs(sampleCubicBezierY(0.5, NAMED_EASINGS["ease-in-out"]) - 0.5),
    ).toBeLessThan(1e-3)
  })
})
