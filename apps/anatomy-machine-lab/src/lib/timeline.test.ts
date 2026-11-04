import { describe, expect, test } from "bun:test"
import {
  advancePlayback,
  clampTime,
  resetPlayback,
  scrubPlayback,
  setSpeed,
} from "./timeline"

describe("timeline", () => {
  test("clampTime bounds scrub values", () => {
    expect(clampTime(-2, 10)).toBe(0)
    expect(clampTime(99, 10)).toBe(10)
    expect(clampTime(3, 10)).toBe(3)
  })

  test("advancePlayback respects pause and speed", () => {
    const base = resetPlayback(20)
    expect(advancePlayback(base, 1).simTime).toBe(0)
    const playing = { ...base, playing: true, speed: 2 }
    expect(advancePlayback(playing, 0.5).simTime).toBeCloseTo(1)
  })

  test("scrub matches integrated play to same t", () => {
    let state = resetPlayback(30)
    state = setSpeed(state, 4)
    state = { ...state, playing: true }
    for (let i = 0; i < 25; i++) {
      state = advancePlayback(state, 0.1)
    }
    const played = state.simTime
    const scrubbed = scrubPlayback(resetPlayback(30), played)
    expect(scrubbed.simTime).toBeCloseTo(played, 5)
  })
})
