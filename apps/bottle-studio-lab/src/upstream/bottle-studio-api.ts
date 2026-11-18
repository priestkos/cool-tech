/**
 * Testable state/preset API extracted from amirmushichge/bottle-studio @ de876d4
 * (vendored index.html). Keep in sync with vendor/amirmushichge-bottle-studio/de876d4/index.html.
 */

export const UPSTREAM_PIN = {
  repo: "https://github.com/amirmushichge/bottle-studio",
  tag: "v1.0.0",
  commit: "de876d4fb2bd3a37654647d4c585170237fe4123",
  committedUtc: "2026-11-06T19:56:27Z",
  license: "MIT",
} as const

export const MM = 100

export type BottleStudioState = {
  sides: number
  corner: number
  shoulder: number
  H: number
  R: number
  neckR: number
  glass: keyof typeof GLASS
  frost: number
  liquid: keyof typeof LIQUID
  fill: number
  closure: keyof typeof CLOSURE
  foil: keyof typeof FOIL
  light: keyof typeof LIGHTS
  lightRot: number
  exposure: number
  mm: number
  aperture: number
  reflect: number
  turntable: boolean
  bd: "wordmark" | "image" | "off"
  bdTitle: string
  bdLine: string
  bdInk: keyof typeof INK
  bdSize: number
  bdY: number
}

export const DEFAULTS: BottleStudioState = {
  sides: 3,
  corner: 0.3,
  shoulder: 0.6,
  H: 2.6,
  R: 0.56,
  neckR: 0.155,
  glass: "ember",
  frost: 0.0,
  liquid: "malt",
  fill: 0.8,
  closure: "lacquer",
  foil: "gold",
  light: "ember",
  lightRot: 0,
  exposure: 1.0,
  mm: 85,
  aperture: 0.5,
  reflect: 0.35,
  turntable: false,
  bd: "wordmark",
  bdTitle: "Ardlow",
  bdLine: "Single malt",
  bdInk: "cream",
  bdSize: 0.9,
  bdY: 0.56,
}

export const GLASS = {
  ember: { name: "Ember", swatch: "#b3200f" },
  smoke: { name: "Smoke", swatch: "#5d4c40" },
  flint: { name: "Flint", swatch: "#dfe6e6" },
  emerald: { name: "Emerald", swatch: "#1d6b44" },
  cobalt: { name: "Cobalt", swatch: "#23379a" },
} as const

export const LIQUID = {
  malt: { name: "Single malt", swatch: "#b8621c" },
  sherry: { name: "Sherry cask", swatch: "#6e1c0c" },
  peated: { name: "Peated", swatch: "#5a3a1a" },
  empty: { name: "Empty", swatch: "transparent" },
} as const

export const CLOSURE = {
  lacquer: { name: "Black lacquer", swatch: "#141010" },
  gold: { name: "Brushed gold", swatch: "#d6a75a" },
  oak: { name: "Oak", swatch: "#8a5a32" },
  copper: { name: "Copper", swatch: "#b8653e" },
} as const

export const FOIL = {
  gold: { name: "Gold foil", swatch: "#e3b56a" },
  silver: { name: "Silver foil", swatch: "#cfd3d8" },
  rose: { name: "Rose foil", swatch: "#dc9d86" },
} as const

export const LIGHTS = {
  ember: { name: "Ember" },
  studio: { name: "Studio" },
  noir: { name: "Noir" },
  dusk: { name: "Dusk" },
} as const

export const INK = {
  cream: { name: "Cream", swatch: "#f6efe6" },
  gold: { name: "Gold", swatch: "#d6a75a" },
  ink: { name: "Ink", swatch: "#1a1412" },
} as const

export const SHOTS = [
  { id: "hero", name: "Hero", mm: 85 },
  { id: "front", name: "Front", mm: 85 },
  { id: "macro", name: "Macro", mm: 105 },
  { id: "shoulder", name: "Shoulder", mm: 100 },
  { id: "low", name: "Low", mm: 35 },
  { id: "profile", name: "Profile", mm: 85 },
] as const

const CIRC = 0.8

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function mergeBottleState(
  state: BottleStudioState,
  patch: Partial<BottleStudioState>
): BottleStudioState {
  return clampBottleState({ ...state, ...patch })
}

export function resetBottleState(): BottleStudioState {
  return structuredClone(DEFAULTS)
}

/** Range clamps mirrored from upstream SPEC control definitions. */
export function clampBottleState(state: BottleStudioState): BottleStudioState {
  return {
    ...state,
    corner: clamp(state.corner, 0.12, 0.48),
    shoulder: clamp(state.shoulder, 0.5, 0.68),
    R: clamp(state.R, 0.44, 0.66),
    frost: clamp(state.frost, 0, 0.35),
    fill: clamp(state.fill, 0, 1),
    lightRot: clamp(state.lightRot, -180, 180),
    exposure: clamp(state.exposure, 0.4, 2),
    reflect: clamp(state.reflect, 0, 0.8),
    mm: clamp(state.mm, 24, 135),
    aperture: clamp(state.aperture, 0, 1),
    bdSize: clamp(state.bdSize, 0.3, 1.4),
    bdY: clamp(state.bdY, 0.1, 0.9),
    bdTitle: state.bdTitle.slice(0, 28),
    bdLine: state.bdLine.slice(0, 28),
  }
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export function levels(state: BottleStudioState) {
  const yb = state.H * state.shoulder
  const ys = yb + state.H * 0.19
  return { yb, ys, wn: state.neckR / CIRC, bev: 0.05, capY: state.H - 0.36 }
}

export function prof(y: number, state: BottleStudioState): [number, number] {
  const { yb, ys, wn, bev } = levels(state)
  const R = state.R
  if (y < bev) {
    const d = bev - y
    return [R - bev + Math.sqrt(Math.max(0, bev * bev - d * d)), 0]
  }
  if (y < yb) return [R * (1 - 0.012 * (y / yb)), 0]
  if (y < ys) {
    const t = (y - yb) / (ys - yb)
    const Rt = R * 0.988
    const e = Math.pow(smooth(0, 1, t), 0.9)
    return [Rt + (wn - Rt) * e, smooth(0.0, 0.8, t)]
  }
  const tn = (y - ys) / (state.H - ys)
  const bead = Math.exp(-Math.pow((y - (state.H - 0.43)) / 0.018, 2)) * 0.022
  return [wn * (1 - 0.035 * tn) + bead / CIRC, 1]
}

export function formatMillimetres(sceneUnits: number): string {
  return `${Math.round(sceneUnits * MM)} mm`
}

export function dimensionReadout(state: BottleStudioState): string {
  const w = 2 * state.R * (state.sides === 0 ? CIRC : 1)
  return `H ${Math.round((state.H + 0.13) * MM)} · W ${Math.round(w * MM)} mm`
}

export function shotById(id: string) {
  return SHOTS.find((s) => s.id === id)
}

export function exposureEvLabel(exposure: number): string {
  const ev = Math.log2(exposure)
  return `${ev >= 0 ? "+" : ""}${ev.toFixed(1)} EV`
}