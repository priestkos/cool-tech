import { describe, expect, test } from "bun:test"
import { NAMED_EASINGS } from "./bezier"
import { buildSyntheticTrack } from "./keyframes"
import { computeCheckRows, detectMotionWindow, easingRmse } from "./metrics"
import { computeOverallScore } from "./score"
import type { AnimationSpec } from "./types"

const reference: AnimationSpec = {
  delayMs: 0,
  durationMs: 500,
  easing: { kind: "named", name: "ease-out", points: NAMED_EASINGS["ease-out"] },
  keyframes: [
    { offset: 0, translateY: 40, opacity: 0, scale: 1 },
    { offset: 1, translateY: 0, opacity: 1, scale: 1 },
  ],
}

describe("metrics", () => {
  test("detects motion window on synthetic track", () => {
    const track = buildSyntheticTrack(reference, 60, 600).translateY
    const win = detectMotionWindow(track)
    expect(win.durationMs).toBeGreaterThan(400)
  })

  test("identical tracks yield zero easing rmse", () => {
    const track = buildSyntheticTrack(reference, 30, 600).translateY
    expect(easingRmse(track, track, reference)).toBeLessThan(0.05)
  })

  test("score is 100 when copy matches reference", () => {
    const tracks = buildSyntheticTrack(reference, 60, 600)
    const rows = computeCheckRows(reference, reference, tracks, tracks)
    expect(computeOverallScore(rows)).toBe(100)
  })
})
