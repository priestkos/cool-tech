import type { BuiltInEmotion, BuiltInState, OrbPalette, OrbPreset, PaletteName } from "talking-marble"

export const BUILTIN_STATES = [
  "idle",
  "connecting",
  "listening",
  "thinking",
  "searching",
  "speaking",
  "error",
] as const satisfies readonly BuiltInState[]

export const BUILTIN_EMOTIONS = [
  "happy",
  "calm",
  "excited",
  "curious",
  "surprised",
  "concerned",
  "sad",
  "muted",
] as const satisfies readonly BuiltInEmotion[]

export const PALETTE_NAMES = [
  "pearl",
  "ember",
  "lagoon",
  "ink",
  "rose",
  "aurora",
] as const satisfies readonly PaletteName[]

/** Custom preset shown on both React and Web Component paths. */
export const LAB_CUSTOM_PRESETS: Record<string, OrbPreset> = {
  labGlow: {
    speed: 1.45,
    glow: 0.35,
    bounce: 0.55,
    reactivity: 0.95,
    label: "lab glow",
  },
}

export type LabOrbState = BuiltInState | "labGlow"

export type AudioMode = "level" | "mock" | "mic" | "off"

export interface MarbleLabConfig {
  state: LabOrbState
  emotion: BuiltInEmotion | null
  paletteMode: "named" | "custom"
  paletteName: PaletteName
  customColors: [string, string, string, string]
  level: number
  size: number
  halo: boolean | number
  paused: boolean
  label: string
  decorative: boolean
  ariaLabel: string
  useAriaLabel: boolean
  audioMode: AudioMode
}

export function resolveLabPalette(config: MarbleLabConfig): OrbPalette {
  if (config.paletteMode === "named") return config.paletteName
  return [...config.customColors]
}

export function accessibleNameForMarble(config: MarbleLabConfig): string {
  if (config.decorative) return "(decorative — hidden from assistive tech)"
  if (config.useAriaLabel && config.ariaLabel.trim()) return config.ariaLabel.trim()
  const stateLabel = config.state === "labGlow" ? "lab glow" : config.state
  return `${config.label}, ${stateLabel}`
}

export interface MarbleViewerProps {
  state: LabOrbState
  emotion: BuiltInEmotion | null
  palette: OrbPalette
  level?: number
  audio: import("talking-marble").OrbAudioSource | null
  size: number
  halo: boolean | number
  paused: boolean
  label: string
  decorative: boolean
  ariaLabel?: string
  presets: Record<string, OrbPreset>
}

/** Shared props for React and Web Component viewers. */
export function marbleViewerProps(config: MarbleLabConfig, audio: MarbleViewerProps["audio"]): MarbleViewerProps {
  const useLevel = config.audioMode === "level" || (config.audioMode === "off" && config.level > 0)
  return {
    state: config.state,
    emotion: config.emotion,
    palette: resolveLabPalette(config),
    level: useLevel ? config.level : undefined,
    audio: config.audioMode === "mock" || config.audioMode === "mic" ? audio : null,
    size: config.size,
    halo: config.halo,
    paused: config.paused,
    label: config.label,
    decorative: config.decorative,
    ariaLabel: config.useAriaLabel ? config.ariaLabel : undefined,
    presets: LAB_CUSTOM_PRESETS,
  }
}

export function syncPropsToWebComponent(
  el: HTMLElement & {
    state: string
    emotion: string | null
    palette?: OrbPalette
    level?: number
    size?: number
    halo: boolean | number
    paused: boolean
    label?: string
    decorative: boolean
    audio: MarbleViewerProps["audio"]
    presets?: Record<string, OrbPreset>
  },
  props: MarbleViewerProps,
) {
  el.state = props.state
  el.emotion = props.emotion
  el.palette = props.palette
  if (props.level !== undefined) el.level = props.level
  else el.level = undefined
  el.size = props.size
  el.halo = props.halo
  el.paused = props.paused
  el.label = props.label
  el.decorative = props.decorative
  el.audio = props.audio
  el.presets = props.presets
}

export const DEFAULT_LAB_CONFIG: MarbleLabConfig = {
  state: "idle",
  emotion: null,
  paletteMode: "named",
  paletteName: "pearl",
  customColors: ["#f6f5ee", "#ef9fc5", "#61d9d0", "#f3c76f"],
  level: 0,
  size: 140,
  halo: true,
  paused: false,
  label: "Assistant",
  decorative: false,
  ariaLabel: "",
  useAriaLabel: false,
  audioMode: "level",
}