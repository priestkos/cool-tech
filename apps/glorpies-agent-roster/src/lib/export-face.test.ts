import { describe, expect, test } from "bun:test"
import {
  assertSvgWellFormed,
  buildExportFileName,
  sanitizeExportBase,
} from "./export-face"

describe("export helpers", () => {
  test("builds safe file names", () => {
    expect(buildExportFileName("agent 47", "svg")).toBe("glorpie-agent-47.svg")
    expect(buildExportFileName("???", "png")).toBe("glorpie-glorpie.png")
    expect(sanitizeExportBase("")).toBe("glorpie")
  })

  test("SVG validation rejects external URLs", () => {
    const local = '<svg xmlns="http://www.w3.org/2000/svg"><circle r="1"/></svg>'
    expect(assertSvgWellFormed(local)).toBe(true)
    expect(assertSvgWellFormed('<svg><image href="https://evil.test/x"/></svg>')).toBe(false)
    expect(assertSvgWellFormed("not svg")).toBe(false)
  })
})
