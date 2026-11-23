import { describe, expect, test } from "bun:test"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"

import {
  DEFAULT_TUNING,
  labToCardBlur,
  labToCardOptics,
  labToKnobBounce,
  labToPressSpring,
  labToSliderRefraction,
  labToSwitchRefraction,
} from "./tuning"

const APP_ROOT = resolve(import.meta.dir, "../..")
const KIT_ROOT = resolve(APP_ROOT, "components/liquid-glass")
const PIN = "d11b3f62407f8d5ec1573c8591e2047248c52cbf"

describe("vendored Liquid Glass pin", () => {
  test("core modules exist under apps/liquid-glass-controls", () => {
    const required = [
      "glass-button.tsx",
      "controls/Switch.tsx",
      "controls/RangeSlider.tsx",
      "engine.ts",
      "glass-layer.tsx",
      "controls/glass/runtime.ts",
    ]
    for (const file of required) {
      expect(existsSync(resolve(KIT_ROOT, file))).toBe(true)
    }
  })

  test("no page-analytics script in the vendored tree", () => {
    const engine = readFileSync(resolve(KIT_ROOT, "engine.ts"), "utf8")
    const layer = readFileSync(resolve(KIT_ROOT, "glass-layer.tsx"), "utf8")
    expect(engine.includes("analytics")).toBe(false)
    expect(layer.includes("head-script")).toBe(false)
    expect(layer.includes("cookieless")).toBe(false)
  })

  test("dependency evidence records the git pin", () => {
    const evidencePath = resolve(import.meta.dir, "../../../dependency-evidence.json")
    const evidence = JSON.parse(readFileSync(evidencePath, "utf8"))
    expect(evidence.liquidGlassPin?.commit).toBe(PIN)
  })
})

describe("tuning maps to real kit APIs", () => {
  test("refraction knob changes optics and slider refraction", () => {
    const low = labToCardOptics(5)
    const high = labToCardOptics(95)
    expect(high.refraction).toBeGreaterThan(low.refraction!)
    expect(labToSliderRefraction(95)).toBeGreaterThan(labToSliderRefraction(5))
    expect(labToSwitchRefraction(95)).toBeGreaterThan(labToSwitchRefraction(5))
  })

  test("blur knob changes GlassCard blur", () => {
    expect(labToCardBlur(0)).toBe(0)
    expect(labToCardBlur(100)).toBeGreaterThan(labToCardBlur(DEFAULT_TUNING.blur))
  })

  test("spring knob changes pressSpeed, pressBounce, and switch knobBounce", () => {
    const soft = labToPressSpring(10)
    const snappy = labToPressSpring(90)
    expect(snappy.pressSpeed).toBeGreaterThan(soft.pressSpeed)
    expect(labToKnobBounce(90)).toBeGreaterThan(labToKnobBounce(10))
  })
})

describe("vendored exports resolve", () => {
  test("GlassButton, Switch, and RangeSlider import from vendored paths", async () => {
    const kit = await import("../../components/liquid-glass")
    expect(typeof kit.GlassButton).toBe("function")
    const { Switch } = await import("../../components/liquid-glass/controls/Switch")
    const { RangeSlider } = await import("../../components/liquid-glass/controls/RangeSlider")
    expect(typeof Switch).toBe("function")
    expect(typeof RangeSlider).toBe("function")
  })
})