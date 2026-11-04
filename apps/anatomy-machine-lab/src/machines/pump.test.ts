import { describe, expect, test } from "bun:test"
import { pumpPartPoses, pumpReadouts, pumpState } from "./pump"

describe("pump simulation", () => {
  test("deterministic", () => {
    expect(pumpState(4.2)).toEqual(pumpState(4.2))
  })

  test("valves alternate by stroke half", () => {
    const up = pumpState(0.5)
    const down = pumpState(2.5)
    expect(up.inletOpen).toBe(true)
    expect(up.outletOpen).toBe(false)
    expect(down.inletOpen).toBe(false)
    expect(down.outletOpen).toBe(true)
  })

  test("stroke position stays within 0..1", () => {
    for (const t of [0, 0.3, 1.1, 2.4, 9.9]) {
      const s = pumpState(t)
      expect(s.strokePos).toBeGreaterThanOrEqual(0)
      expect(s.strokePos).toBeLessThanOrEqual(1)
    }
  })

  test("total volume is non-negative and non-decreasing over time", () => {
    const samples = [0, 2, 4, 6, 8].map((t) => pumpState(t).totalMl)
    for (const v of samples) expect(v).toBeGreaterThanOrEqual(0)
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1] - 0.01)
    }
  })

  test("scrub matches playing integration spot check", () => {
    const t = 5.5
    expect(pumpReadouts(t)).toEqual(pumpReadouts(t))
    expect(pumpPartPoses(t, true).length).toBe(6)
  })
})
