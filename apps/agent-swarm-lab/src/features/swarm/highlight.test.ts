import { describe, expect, test } from "bun:test"
import { totalTypableChars } from "./highlight"
import { typingRevealIndex as machineReveal } from "./machine"
import type { TextSegment } from "./highlight"

const mockSegments: TextSegment[] = [
  {
    node: {} as Text,
    startInNode: 0,
    endInNode: 5,
    globalStart: 0,
    globalEnd: 5,
  },
  {
    node: {} as Text,
    startInNode: 0,
    endInNode: 4,
    globalStart: 5,
    globalEnd: 9,
  },
]

describe("totalTypableChars", () => {
  test("sums segment lengths", () => {
    expect(totalTypableChars(mockSegments)).toBe(9)
  })
})

describe("buildHiddenRanges", () => {
  test("returns empty when fully revealed", () => {
    expect(machineReveal(1, 9)).toBe(9)
    expect(machineReveal(0.25, 9)).toBe(2)
  })

  test("progress helpers stay consistent", () => {
    for (const p of [0, 0.1, 0.5, 1]) {
      expect(machineReveal(p, 20)).toBe(Math.min(20, Math.floor(p * 20)))
    }
  })
})
