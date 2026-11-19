import { describe, expect, test } from "bun:test"
import { existsSync } from "node:fs"
import path from "node:path"
import { AXIS_RANGES, buildFontVariationSettings, clampAxis } from "./allo-axes"
import { buildFontFeatureSettings, DEFAULT_FEATURES, type FeatureState } from "./allo-features"
import { applyPreset, buildCopyCssBlock, PRESETS } from "./allo-presets"

describe("allo axes", () => {
  test("clampAxis respects wght, ROND, opsz ranges", () => {
    expect(clampAxis("wght", 50)).toBe(AXIS_RANGES.wght.min)
    expect(clampAxis("wght", 1200)).toBe(AXIS_RANGES.wght.max)
    expect(clampAxis("ROND", -5)).toBe(0)
    expect(clampAxis("opsz", 10)).toBe(14)
    expect(clampAxis("opsz", 40)).toBe(32)
  })

  test("buildFontVariationSettings maps axis values", () => {
    expect(buildFontVariationSettings(400, 50, 14, true)).toBe('"wght" 400, "ROND" 50')
    expect(buildFontVariationSettings(400, 50, 20, false)).toBe(
      '"wght" 400, "ROND" 50, "opsz" 20',
    )
  })
})

describe("allo features", () => {
  test("buildFontFeatureSettings reflects toggles", () => {
    const on: FeatureState = { ...DEFAULT_FEATURES, ss01: true, tnum: true }
    expect(buildFontFeatureSettings(on)).toBe('"ss01" 1, "tnum" 1')
    expect(buildFontFeatureSettings(DEFAULT_FEATURES)).toBe("normal")
  })
})

describe("presets and export", () => {
  test("applyPreset applies sharp personality axes", () => {
    const next = applyPreset("sharp", {
      wght: 400,
      rond: 50,
      opsz: 14,
      autoOpsz: true,
    })
    expect(next.wght).toBe(PRESETS.sharp.axes.wght)
    expect(next.rond).toBe(PRESETS.sharp.axes.rond)
  })

  test("buildCopyCssBlock includes variation and features", () => {
    const block = buildCopyCssBlock(
      { wght: 500, rond: 25, opsz: 20, autoOpsz: false },
      { ...DEFAULT_FEATURES, frac: true },
      { calt: true },
    )
    expect(block).toContain('font-family: "Allo"')
    expect(block).toContain('"wght" 500')
    expect(block).toContain('"frac" 1')
    expect(block).toContain('"calt" 1')
  })
})

describe("allo-font package", () => {
  const root = path.resolve(import.meta.dir, "../../node_modules/allo-font")

  test("WOFF2 variable font and OFL notice are present", () => {
    expect(existsSync(path.join(root, "fonts/webfonts/AlloVariable.woff2"))).toBe(true)
    expect(existsSync(path.join(root, "OFL.txt"))).toBe(true)
    expect(existsSync(path.resolve(import.meta.dir, "../../THIRD_PARTY_LICENSES.md"))).toBe(true)
  })
})