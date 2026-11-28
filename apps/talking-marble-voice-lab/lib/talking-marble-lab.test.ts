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
  applyAudioMode,
  applyLevelChange,
  resolveLabPalette,
  type MarbleLabConfig,
  type MarbleViewerProps,
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

function labConfig(partial: Partial<MarbleLabConfig> = {}): MarbleLabConfig {
  return { ...DEFAULT_LAB_CONFIG, ...partial }
}

describe("accessible name", () => {
  test("decorative wins, trimmed aria-label wins, blank aria-label falls through, labGlow reads as lab glow", () => {
    expect(
      accessibleNameForMarble(
        labConfig({
          decorative: true,
          ariaLabel: "Nova voice",
          useAriaLabel: true,
          label: "Ignored",
          state: "speaking",
        }),
      ),
    ).toBe("(decorative — hidden from assistive tech)")

    expect(
      accessibleNameForMarble(labConfig({ useAriaLabel: true, ariaLabel: "  Nova voice  " })),
    ).toBe("Nova voice")

    expect(
      accessibleNameForMarble(
        labConfig({
          useAriaLabel: true,
          ariaLabel: "   ",
          label: "Assistant",
          state: "speaking",
        }),
      ),
    ).toBe("Assistant, speaking")

    expect(accessibleNameForMarble(labConfig({ state: "labGlow" }))).toBe("Assistant, lab glow")
  })
})

describe("resolveLabPalette", () => {
  test("named mode returns the palette name and custom mode returns a copy", () => {
    expect(resolveLabPalette(labConfig({ paletteMode: "named", paletteName: "lagoon" }))).toBe("lagoon")

    const config = labConfig({
      paletteMode: "custom",
      customColors: ["#111111", "#222222", "#333333", "#444444"],
    })
    const palette = resolveLabPalette(config)
    expect(palette).toEqual(["#111111", "#222222", "#333333", "#444444"])
    expect(palette).not.toBe(config.customColors)
    if (Array.isArray(palette)) {
      palette[0] = "#ffffff"
    }
    expect(config.customColors[0]).toBe("#111111")
  })
})

describe("marbleViewerProps audio routing", () => {
  test("routes level, off, mock, and mic without leaking a stale level", () => {
    const sentinel = { id: "sentinel-audio" } as MarbleViewerProps["audio"]

    const levelZero = marbleViewerProps(labConfig({ audioMode: "level", level: 0 }), sentinel)
    expect(levelZero.level).toBe(0)
    expect(levelZero.audio).toBeNull()

    const levelHigh = marbleViewerProps(labConfig({ audioMode: "level", level: 0.55 }), sentinel)
    expect(levelHigh.level).toBe(0.55)
    expect(levelHigh.audio).toBeNull()

    const offZero = marbleViewerProps(labConfig({ audioMode: "off", level: 0 }), sentinel)
    expect(offZero.level).toBeUndefined()
    expect(offZero.audio).toBeNull()

    const offHigh = marbleViewerProps(labConfig({ audioMode: "off", level: 0.33 }), sentinel)
    expect(offHigh.level).toBe(0.33)
    expect(offHigh.audio).toBeNull()

    const mock = marbleViewerProps(labConfig({ audioMode: "mock", level: 0.8 }), sentinel)
    expect(mock.audio).toBe(sentinel)
    expect(mock.level).toBeUndefined()

    const mic = marbleViewerProps(labConfig({ audioMode: "mic", level: 0.8 }), sentinel)
    expect(mic.audio).toBe(sentinel)
    expect(mic.level).toBeUndefined()

    const unlabeled = marbleViewerProps(labConfig({ useAriaLabel: false, ariaLabel: "hidden" }), null)
    expect(unlabeled.ariaLabel).toBeUndefined()

    const emptyLabel = marbleViewerProps(labConfig({ useAriaLabel: true, ariaLabel: "" }), null)
    expect(emptyLabel.ariaLabel).toBe("")

    const haloStrength = marbleViewerProps(
      labConfig({ halo: 0.4, paused: true, decorative: true }),
      null,
    )
    expect(haloStrength.halo).toBe(0.4)
    expect(haloStrength.paused).toBe(true)
    expect(haloStrength.decorative).toBe(true)

    const haloOff = marbleViewerProps(labConfig({ halo: false, paused: false, decorative: false }), null)
    expect(haloOff.halo).toBe(false)
    expect(haloOff.paused).toBe(false)
    expect(haloOff.decorative).toBe(false)
  })
})

describe("syncPropsToWebComponent", () => {
  test("sets level when provided and clears a stale level", () => {
    const el = {
      state: "idle",
      emotion: null as BuiltInEmotion | null,
      palette: "pearl" as const,
      level: 0.9,
      size: 140,
      halo: true as boolean | number,
      paused: false,
      label: "Assistant",
      decorative: false,
      audio: null as MarbleViewerProps["audio"],
      presets: {} as Record<string, import("talking-marble").OrbPreset>,
    }
    const withLevel = marbleViewerProps(labConfig({ audioMode: "level", level: 0.9 }), null)
    syncPropsToWebComponent(el, withLevel)
    expect(el.level).toBe(0.9)

    const cleared = marbleViewerProps(labConfig({ audioMode: "off", level: 0 }), null)
    expect(cleared.level).toBeUndefined()
    syncPropsToWebComponent(el, cleared)
    expect(el.level).toBeUndefined()
  })
})

describe("level and audio mode transitions", () => {
  test("applyLevelChange crosses 0.02 only from idle or listening and leaves mock or mic alone", () => {
    expect(applyLevelChange(labConfig({ state: "idle", audioMode: "level" }), 0.02).state).toBe("idle")
    expect(applyLevelChange(labConfig({ state: "idle" }), 0.03).state).toBe("speaking")
    expect(applyLevelChange(labConfig({ state: "listening" }), 0.03).state).toBe("speaking")

    for (const state of ["thinking", "speaking", "error", "labGlow"] as const) {
      expect(applyLevelChange(labConfig({ state }), 0.5).state).toBe(state)
    }

    const listening = applyLevelChange(labConfig({ state: "listening", audioMode: "level" }), 0)
    expect(listening.state).toBe("listening")
    expect(listening.level).toBe(0)

    const fromOff = applyLevelChange(labConfig({ audioMode: "off", state: "idle" }), 0.5)
    expect(fromOff.audioMode).toBe("level")
    expect(fromOff.level).toBe(0.5)
    expect(fromOff.state).toBe("speaking")

    expect(applyLevelChange(labConfig({ audioMode: "mock", state: "idle" }), 0.5).audioMode).toBe("mock")
    expect(applyLevelChange(labConfig({ audioMode: "mic", state: "listening" }), 0.5).audioMode).toBe("mic")
  })

  test("applyAudioMode leaves idle only when the mode is off", () => {
    expect(applyAudioMode(labConfig({ state: "idle" }), "off")).toMatchObject({
      audioMode: "off",
      state: "idle",
    })
    expect(applyAudioMode(labConfig({ state: "idle" }), "level")).toMatchObject({
      audioMode: "level",
      state: "listening",
    })
    expect(applyAudioMode(labConfig({ state: "idle" }), "mock")).toMatchObject({
      audioMode: "mock",
      state: "listening",
    })
    expect(applyAudioMode(labConfig({ state: "idle" }), "mic")).toMatchObject({
      audioMode: "mic",
      state: "listening",
    })
    expect(applyAudioMode(labConfig({ state: "speaking" }), "level")).toMatchObject({
      audioMode: "level",
      state: "speaking",
    })
    expect(applyAudioMode(labConfig({ state: "speaking" }), "off")).toMatchObject({
      audioMode: "off",
      state: "speaking",
    })
    expect(applyAudioMode(labConfig({ state: "listening" }), "mock")).toMatchObject({
      audioMode: "mock",
      state: "listening",
    })
  })
})