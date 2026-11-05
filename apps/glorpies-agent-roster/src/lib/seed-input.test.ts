import { describe, expect, test } from "bun:test"
import { parseSeedInput, toggleSeedMode } from "./seed-input"

describe("seed input parsing", () => {
  test("string mode keeps text; empty becomes placeholder", () => {
    expect(parseSeedInput("agent-47", "string").name).toBe("agent-47")
    expect(parseSeedInput("42", "string").name).toBe("42")
    expect(parseSeedInput("", "string").name).toBe("unnamed-glorp")
  })

  test("number mode parses numeric seeds; bad input never throws", () => {
    expect(parseSeedInput("42", "number").name).toBe(42)
    expect(parseSeedInput("  7  ", "number").name).toBe(7)
    expect(parseSeedInput("not-a-number", "number").name).toBe(0)
    expect(parseSeedInput("", "number").name).toBe(0)
  })

  test("toggleSeedMode alternates modes", () => {
    expect(toggleSeedMode("string")).toBe("number")
    expect(toggleSeedMode("number")).toBe("string")
  })
})
