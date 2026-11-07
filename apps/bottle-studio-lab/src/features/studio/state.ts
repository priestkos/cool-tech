export type SilhouettePreset = "classic" | "slim" | "square" | "tall"

export type LightPreset = "studio" | "warm" | "cool" | "dramatic"

export interface StudioState {
  silhouette: SilhouettePreset
  bodyWidth: number
  shoulder: number
  neckWidth: number
  height: number
  glassHex: string
  glassOpacity: number
  fillAmount: number
  fillHex: string
  lightIntensity: number
  lightAzimuth: number
  lightElevation: number
  lightPreset: LightPreset
  cameraZoom: number
  autoRotate: boolean
  wordmark: string
  wordmarkScale: number
}

export const DEFAULT_STUDIO_STATE: StudioState = {
  silhouette: "classic",
  bodyWidth: 1,
  shoulder: 0.45,
  neckWidth: 0.32,
  height: 2.4,
  glassHex: "#c8e8f0",
  glassOpacity: 0.35,
  fillAmount: 0.62,
  fillHex: "#e85d4a",
  lightIntensity: 1.15,
  lightAzimuth: 42,
  lightElevation: 38,
  lightPreset: "studio",
  cameraZoom: 1,
  autoRotate: true,
  wordmark: "Bottle Studio",
  wordmarkScale: 1,
}

const SILHOUETTE_DEFAULTS: Record<
  SilhouettePreset,
  Pick<StudioState, "bodyWidth" | "shoulder" | "neckWidth" | "height">
> = {
  classic: { bodyWidth: 1, shoulder: 0.45, neckWidth: 0.32, height: 2.4 },
  slim: { bodyWidth: 0.72, shoulder: 0.62, neckWidth: 0.26, height: 2.8 },
  square: { bodyWidth: 1.18, shoulder: 0.22, neckWidth: 0.36, height: 2.1 },
  tall: { bodyWidth: 0.85, shoulder: 0.55, neckWidth: 0.28, height: 3.1 },
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function clampStudioState(state: StudioState): StudioState {
  return {
    ...state,
    bodyWidth: clamp(state.bodyWidth, 0.55, 1.45),
    shoulder: clamp(state.shoulder, 0.1, 0.9),
    neckWidth: clamp(state.neckWidth, 0.18, 0.55),
    height: clamp(state.height, 1.6, 3.6),
    glassOpacity: clamp(state.glassOpacity, 0.08, 0.85),
    fillAmount: clamp(state.fillAmount, 0, 1),
    lightIntensity: clamp(state.lightIntensity, 0.2, 2.5),
    lightAzimuth: clamp(state.lightAzimuth, 0, 360),
    lightElevation: clamp(state.lightElevation, 5, 85),
    cameraZoom: clamp(state.cameraZoom, 0.6, 1.8),
    wordmarkScale: clamp(state.wordmarkScale, 0.5, 2),
    wordmark: state.wordmark.slice(0, 48),
  }
}

export function applySilhouettePreset(
  state: StudioState,
  silhouette: SilhouettePreset
): StudioState {
  return clampStudioState({
    ...state,
    silhouette,
    ...SILHOUETTE_DEFAULTS[silhouette],
  })
}

export function lightPresetMultipliers(
  preset: LightPreset
): { key: number; fill: number; ambient: number; rim: number } {
  switch (preset) {
    case "warm":
      return { key: 1.05, fill: 0.75, ambient: 0.55, rim: 0.35 }
    case "cool":
      return { key: 0.95, fill: 0.65, ambient: 0.48, rim: 0.55 }
    case "dramatic":
      return { key: 1.35, fill: 0.25, ambient: 0.22, rim: 0.85 }
    default:
      return { key: 1, fill: 0.7, ambient: 0.45, rim: 0.4 }
  }
}

export function mergeStudioState(
  state: StudioState,
  patch: Partial<StudioState>
): StudioState {
  return clampStudioState({ ...state, ...patch })
}

export function resetStudioState(): StudioState {
  return { ...DEFAULT_STUDIO_STATE }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "").trim()
  const normalized =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((c) => c + c)
          .join("")
      : cleaned.slice(0, 6)
  const value = Number.parseInt(normalized, 16)
  if (Number.isNaN(value)) {
    return { r: 0.8, g: 0.9, b: 0.95 }
  }
  return {
    r: ((value >> 16) & 255) / 255,
    g: ((value >> 8) & 255) / 255,
    b: (value & 255) / 255,
  }
}
