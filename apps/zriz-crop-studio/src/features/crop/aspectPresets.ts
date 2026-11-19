import type { Aspect } from "@zriz/core"

export type CropShape = "rect" | "circle"

export type AspectPresetId =
  | "free"
  | "original"
  | "square"
  | "4:5"
  | "16:9"
  | "circle"

export type AspectPreset = {
  id: AspectPresetId
  label: string
  aspect: Aspect
  shape: CropShape
}

export const ASPECT_PRESETS: readonly AspectPreset[] = [
  { id: "free", label: "Free", aspect: "free", shape: "rect" },
  { id: "original", label: "Original", aspect: "original", shape: "rect" },
  { id: "square", label: "Square", aspect: 1, shape: "rect" },
  { id: "4:5", label: "4:5", aspect: 4 / 5, shape: "rect" },
  { id: "16:9", label: "16:9", aspect: 16 / 9, shape: "rect" },
  { id: "circle", label: "Circle avatar", aspect: 1, shape: "circle" },
] as const

export const presetById = (id: AspectPresetId): AspectPreset => {
  const preset = ASPECT_PRESETS.find((p) => p.id === id)
  if (!preset) throw new Error(`Unknown preset: ${id}`)
  return preset
}

export const zrizAspectValue = (
  preset: AspectPreset,
  orientationLandscape: boolean,
): Aspect => {
  if (preset.shape === "circle" || preset.aspect === "free" || preset.aspect === "original") {
    return preset.aspect
  }
  if (typeof preset.aspect !== "number") return preset.aspect
  if (!orientationLandscape) return preset.aspect
  return 1 / preset.aspect
}