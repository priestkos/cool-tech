import { describe, expect, test } from "bun:test"
import { NAMED_EASINGS } from "./bezier"
import { buildSyntheticTrack, interpolateProperty } from "./keyframes"
import type { AnimationSpec } from "./types"

const spec: AnimationSpec = {
  delayMs: 100,
  durationMs: 400,
  easing: { kind: "linear", },
  keyframes: [
    { offset: 0, translateY: 20, opacity: 0, scale: 0.9 },
    { offset: 1, translateY: 0, opacity: 1, scale: 1 },
  ],
}

describe("keyframe interpolation", () => {
  test("holds first keyframe before delay", () => {
    expect(interpolateProperty(spec, 0, "translateY")).toBe(20)
  })

  test("reaches final keyframe after animation ends", () => {
    expect(interpolateProperty(spec, 600, "opacity")).toBe(1)
  })

  test("midpoint with linear easing", () => {
    expect(interpolateProperty(spec, 300, "translateY")).toBeCloseTo(10, 1)
  })

  test("synthetic track spans requested duration", () => {
    const tracks = buildSyntheticTrack(spec, 60, 600)
    expect(tracks.translateY[0].timeMs).toBe(0)
    expect(tracks.translateY.at(-1)?.timeMs).toBeGreaterThanOrEqual(600)
  })

  test("eased midpoint differs from linear for ease-out", () => {
    const eased: AnimationSpec = {
      ...spec,
      easing: { kind: "named", name: "ease-out", points: NAMED_EASINGS["ease-out"] },
    }
    const linearMid = interpolateProperty(spec, 300, "translateY")
    const easedMid = interpolateProperty(eased, 300, "translateY")
    expect(easedMid).toBeLessThan(linearMid)
  })
})
