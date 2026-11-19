import type { AxisState } from "./allo-axes"
import { buildFontVariationSettings, clampAxis } from "./allo-axes"
import type { FeatureState } from "./allo-features"
import { buildFontFeatureSettings } from "./allo-features"

export type PresetId = "sharp" | "neutral" | "friendly" | "soft"

export const PRESETS: Record<
  PresetId,
  { label: string; axes: Pick<AxisState, "wght" | "rond">; description: string }
> = {
  sharp: {
    label: "Sharp",
    description: "Tight corners, medium weight",
    axes: { wght: 520, rond: 0 },
  },
  neutral: {
    label: "Neutral",
    description: "Default Allo personality",
    axes: { wght: 400, rond: 50 },
  },
  friendly: {
    label: "Friendly",
    description: "Rounder curves, slightly heavier",
    axes: { wght: 450, rond: 75 },
  },
  soft: {
    label: "Soft",
    description: "Maximum roundness, light weight",
    axes: { wght: 360, rond: 100 },
  },
}

export function applyPreset(presetId: PresetId, current: AxisState): AxisState {
  const preset = PRESETS[presetId]
  return {
    ...current,
    wght: clampAxis("wght", preset.axes.wght),
    rond: clampAxis("ROND", preset.axes.rond),
  }
}

export function buildCopyCssBlock(
  axes: AxisState,
  features: FeatureState,
  extra?: { calt?: boolean; selector?: string },
): string {
  const selector = extra?.selector ?? ".allo-text"
  const variation = buildFontVariationSettings(
    axes.wght,
    axes.rond,
    axes.opsz,
    axes.autoOpsz,
  )
  const featureSettings = buildFontFeatureSettings(features, { calt: extra?.calt })
  const lines = [
    `${selector} {`,
    `  font-family: "Allo", system-ui, sans-serif;`,
    `  font-optical-sizing: ${axes.autoOpsz ? "auto" : "none"};`,
    `  font-variation-settings: ${variation};`,
  ]
  if (featureSettings !== "normal") {
    lines.push(`  font-feature-settings: ${featureSettings};`)
  }
  lines.push("}")
  return lines.join("\n")
}