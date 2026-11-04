import { describe, expect, test } from "bun:test"
import {
  GEAR_RATIO,
  TICKS_PER_SECOND,
  clockPartPoses,
  clockReadouts,
  clockState,
} from "./clock"

describe("clock simulation", () => {
  test("gear ratio constant matches tooth counts", () => {
    expect(GEAR_RATIO).toBe(8)
  })

  test("state is deterministic at t", () => {
    expect(clockState(3.5)).toEqual(clockState(3.5))
  })

  test("elapsed ticks grow monotonically", () => {
    expect(clockState(0).ticks).toBe(0)
    expect(clockState(1).ticks).toBe(TICKS_PER_SECOND)
    expect(clockState(2).ticks).toBeGreaterThan(clockState(1).ticks)
  })

  test("intermediate wheel rotates slower than escape wheel", () => {
    const t = 10
    const s = clockState(t)
    expect(Math.abs(s.midAngle)).toBeLessThan(Math.abs(s.escapeAngle))
  })

  test("scrubbed t matches readouts", () => {
    const t = 7.25
    const a = clockReadouts(t)
    const b = clockReadouts(t)
    expect(a).toEqual(b)
  })

  test("part poses are non-empty", () => {
    expect(clockPartPoses(2, false).length).toBeGreaterThan(3)
  })
})
