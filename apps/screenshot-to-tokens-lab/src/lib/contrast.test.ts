import { describe, expect, test } from "bun:test"
import { contrastRatio, evaluateContrastPair, normalizeHex } from "./contrast"

describe("contrast", () => {
  test("normalizes shorthand hex", () => {
    expect(normalizeHex("#fff")).toBe("#ffffff")
  })

  test("known black on white ratio", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0)
  })

  test("bad input coerced in pair evaluation", () => {
    const result = evaluateContrastPair({
      id: "x",
      label: "x",
      foreground: "not-a-color",
      background: "#ffffff",
    })
    expect(result.foreground).toBe("#000000")
    expect(result.aaNormal).toBe(true)
  })

  test("low contrast fails AA", () => {
    const result = evaluateContrastPair({
      id: "y",
      label: "y",
      foreground: "#777777",
      background: "#888888",
    })
    expect(result.aaNormal).toBe(false)
  })
})
