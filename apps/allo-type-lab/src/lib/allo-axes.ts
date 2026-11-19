import type { CSSProperties } from "react"

export const AXIS_RANGES = {
  wght: { min: 100, max: 900, default: 400 },
  ROND: { min: 0, max: 100, default: 50 },
  opsz: { min: 14, max: 32, default: 14 },
} as const

export type AxisTag = keyof typeof AXIS_RANGES

export function clampAxis(tag: AxisTag, value: number): number {
  const { min, max } = AXIS_RANGES[tag]
  return Math.min(max, Math.max(min, value))
}

export function buildFontVariationSettings(
  wght: number,
  rond: number,
  opsz: number,
  autoOpsz: boolean,
): string {
  const cw = clampAxis("wght", wght)
  const cr = clampAxis("ROND", rond)
  const parts = [`"wght" ${cw}`, `"ROND" ${cr}`]
  if (!autoOpsz) {
    parts.push(`"opsz" ${clampAxis("opsz", opsz)}`)
  }
  return parts.join(", ")
}

export type AxisState = {
  wght: number
  rond: number
  opsz: number
  autoOpsz: boolean
}

export function axisStyle(state: AxisState): CSSProperties {
  return {
    fontFamily: '"Allo", system-ui, sans-serif',
    fontOpticalSizing: state.autoOpsz ? "auto" : "none",
    fontVariationSettings: buildFontVariationSettings(
      state.wght,
      state.rond,
      state.opsz,
      state.autoOpsz,
    ),
  }
}