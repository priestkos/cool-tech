import { describe, expect, test } from "bun:test"
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { palettes, resolvePalette, resolveState } from "talking-marble"
import {
  haloFromAttribute,
  numberFromAttribute,
  paletteFromAttribute,
  presetsFromAttribute,
} from "talking-marble/element"
import type { BuiltInEmotion } from "talking-marble"
import {
  BUILTIN_EMOTIONS,
  BUILTIN_STATES,
  LAB_CUSTOM_PRESETS,
  PALETTE_NAMES,
  marbleViewerProps,
  syncPropsToWebComponent,
  DEFAULT_LAB_CONFIG,
  accessibleNameForMarble,
} from "../src/lib/talking-marble-lab.ts"

describe("talking-marble package exports", () => {
  test("resolveState returns built-in state data", () => {
    for (const name of BUILTIN_STATES) {
      const resolved = resolveState(name)
      expect(resolved).toBeDefined()
    }
    const speaking = resolveState("speaking")
    expect(speaking.reactivity).toBeGreaterThan(0)
  })

  test("resolvePalette returns named palette colours", () => {
    for (const name of PALETTE_NAMES) {
      const resolved = resolvePalette(name)
      const expected = palettes[name]
      expect(resolved).toEqual([...expected])
    }
  })

  test("custom presets merge and labGlow state resolves", () => {
    const merged = resolveState("labGlow", LAB_CUSTOM_PRESETS)
    expect(merged.label).toBe("lab glow")
    expect(merged.reactivity).toBeCloseTo(0.95)
  })
})

describe("viewer prop parity", () => {
  test("React and Web Component share state, emotion, palette, level", () => {
    const config = {
      ...DEFAULT_LAB_CONFIG,
      state: "listening" as const,
      emotion: "curious" as const,
      paletteMode: "named" as const,
      paletteName: "aurora" as const,
      level: 0.42,
      audioMode: "level" as const,
    }
    const props = marbleViewerProps(config, null)
    expect(props.state).toBe("listening")
    expect(props.emotion).toBe("curious")
    expect(props.palette).toBe("aurora")
    expect(props.level).toBe(0.42)

    const stub = {
      state: "idle",
      emotion: null as BuiltInEmotion | null,
      palette: "pearl" as const,
      level: 0,
      size: 0,
      halo: true,
      paused: false,
      label: "",
      decorative: false,
      audio: null,
      presets: {} as Record<string, import("talking-marble").OrbPreset>,
    }
    syncPropsToWebComponent(stub, props)
    expect(stub.state).toBe("listening")
    expect(stub.emotion).toBe("curious")
    expect(stub.palette).toBe("aurora")
    expect(stub.level).toBe(0.42)
    expect(stub.presets).toEqual(LAB_CUSTOM_PRESETS)
  })

  test("accessible name reflects label and state", () => {
    const name = accessibleNameForMarble({
      ...DEFAULT_LAB_CONFIG,
      state: "speaking",
      label: "Nova",
    })
    expect(name).toBe("Nova, speaking")
  })
})

describe("Web Component attribute helpers", () => {
  test("paletteFromAttribute parses name and hex list", () => {
    expect(paletteFromAttribute("lagoon")).toBe("lagoon")
    const custom = paletteFromAttribute("#111111 #222222 #333333 #444444")
    expect(custom).toEqual(["#111111", "#222222", "#333333", "#444444"])
  })

  test("haloFromAttribute parses true/false/strength", () => {
    expect(haloFromAttribute(null)).toBe(true)
    expect(haloFromAttribute("false")).toBe(false)
    expect(haloFromAttribute("0.75")).toBe(0.75)
  })

  test("numberFromAttribute and presetsFromAttribute", () => {
    expect(numberFromAttribute("160")).toBe(160)
    expect(numberFromAttribute("nope")).toBeUndefined()
    const presets = presetsFromAttribute('{"labGlow":{"speed":1.2}}')
    expect(presets?.labGlow?.speed).toBe(1.2)
  })
})

describe("offline app source", () => {
  test("src and lib make no external runtime fetch calls", () => {
    const roots = [
      join(import.meta.dir, "..", "src"),
      join(import.meta.dir, "..", "lib"),
    ]
    const forbidden = /fetch\s*\(\s*['"`]https?:\/\//
    for (const root of roots) {
      for (const file of readdirSync(root, { recursive: true })) {
        const path = join(root, String(file))
        if (!path.endsWith(".ts") && !path.endsWith(".tsx")) continue
        const text = readFileSync(path, "utf8")
        expect(text).not.toMatch(forbidden)
      }
    }
  })

  test("built-in emotion list matches package", () => {
    expect(BUILTIN_EMOTIONS.length).toBe(8)
  })
})