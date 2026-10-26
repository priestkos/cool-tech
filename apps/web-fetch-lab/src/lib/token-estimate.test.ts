import { describe, expect, it } from "bun:test"
import { estimateTokensFromChars, tokenSavingsPercent } from "./token-estimate"

describe("token-estimate", () => {
  it("estimates tokens as chars/4 rounded up", () => {
    expect(estimateTokensFromChars(0)).toBe(0)
    expect(estimateTokensFromChars(4)).toBe(1)
    expect(estimateTokensFromChars(5)).toBe(2)
  })

  it("computes percent saved from raw vs markdown length", () => {
    expect(tokenSavingsPercent(100, 50)).toBe(50)
    expect(tokenSavingsPercent(0, 10)).toBe(0)
  })
})
