import { describe, expect, it } from "vitest"
import { averageMs, speedupRatio } from "./timing"

describe("averageMs", () => {
  it("returns zero for empty input", () => {
    expect(averageMs([])).toBe(0)
  })

  it("averages samples", () => {
    expect(averageMs([10, 20, 30])).toBe(20)
  })
})

describe("speedupRatio", () => {
  it("returns null for invalid inputs", () => {
    expect(speedupRatio(0, 5)).toBeNull()
    expect(speedupRatio(10, 0)).toBeNull()
  })

  it("computes ratio", () => {
    expect(speedupRatio(100, 25)).toBe(4)
  })
})
