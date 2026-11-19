import type { CSSProperties } from "react"

export const FEATURE_IDS = [
  "ss01",
  "ss02",
  "ss03",
  "cv01",
  "cv02",
  "cv03",
  "cv04",
  "cv05",
  "tnum",
  "frac",
  "sups",
  "subs",
] as const

export type FeatureId = (typeof FEATURE_IDS)[number]

export type FeatureState = Record<FeatureId, boolean>

export const FEATURE_LABELS: Record<FeatureId, string> = {
  ss01: "Single-story a",
  ss02: "Disambiguation (I, l, 1, 0)",
  ss03: "Open figures (4, 6, 9)",
  cv01: "Footed 1",
  cv02: "Slashed zero",
  cv03: "Tailed l",
  cv04: "Serifed I",
  cv05: "Dotted zero",
  tnum: "Tabular figures",
  frac: "Fractions",
  sups: "Superscript",
  subs: "Subscript",
}

export const FEATURE_SAMPLES: Record<FeatureId, { off: string; on: string }> = {
  ss01: { off: "Allo asks always.", on: "Allo asks always." },
  ss02: { off: "Illinois 101 0O", on: "Illinois 101 0O" },
  ss03: { off: "409 696 949", on: "409 696 949" },
  cv01: { off: "111", on: "111" },
  cv02: { off: "10080", on: "10080" },
  cv03: { off: "Illustrious", on: "Illustrious" },
  cv04: { off: "Illinois", on: "Illinois" },
  cv05: { off: "10080", on: "10080" },
  tnum: {
    off: "1,234.56\n9,876.54",
    on: "1,234.56\n9,876.54",
  },
  frac: { off: "1/2 3/4", on: "1/2 3/4" },
  sups: { off: "x2", on: "m²" },
  subs: { off: "H2O", on: "H₂O" },
}

export const DEFAULT_FEATURES: FeatureState = Object.fromEntries(
  FEATURE_IDS.map((id) => [id, false]),
) as FeatureState

export function buildFontFeatureSettings(
  features: Partial<FeatureState>,
  options?: { calt?: boolean },
): string {
  const enabled = FEATURE_IDS.filter((id) => features[id]).map((id) => `"${id}" 1`)
  if (options?.calt === false) {
    enabled.push(`"calt" 0`)
  } else if (options?.calt === true) {
    enabled.push(`"calt" 1`)
  }
  return enabled.length > 0 ? enabled.join(", ") : "normal"
}

export function featureStyle(features: Partial<FeatureState>, calt?: boolean): CSSProperties {
  const settings = buildFontFeatureSettings(features, { calt })
  return settings === "normal"
    ? {}
    : { fontFeatureSettings: settings }
}