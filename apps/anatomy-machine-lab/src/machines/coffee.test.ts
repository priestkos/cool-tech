import { describe, expect, test } from "bun:test"
import { coffeePartPoses, coffeeReadouts, coffeeState } from "./coffee"

describe("coffee simulation", () => {
  test("deterministic at t", () => {
    expect(coffeeState(12)).toEqual(coffeeState(12))
  })

  test("volume is non-negative and monotonic during brew", () => {
    const a = coffeeState(10).volumeMl
    const b = coffeeState(15).volumeMl
    expect(a).toBeGreaterThanOrEqual(0)
    expect(b).toBeGreaterThanOrEqual(a)
  })

  test("flow is zero while heating", () => {
    expect(coffeeState(2).flowMlPerSec).toBe(0)
  })

  test("temperature rises during heat phase", () => {
    expect(coffeeState(4).tempC).toBeGreaterThan(coffeeState(1).tempC)
  })

  test("readouts update when scrubbing", () => {
    expect(coffeeReadouts(5)[0].value).not.toBe(coffeeReadouts(20)[0].value)
  })

  test("part poses include carafe level", () => {
    const low = coffeePartPoses(1, false).find((p) => p.partId === "carafe")
    const high = coffeePartPoses(20, false).find((p) => p.partId === "carafe")
    expect(high!.size.z).toBeGreaterThan(low!.size.z)
  })
})
