import type { KnobDef, KnobKind, KnobValues } from "./types"

type RawParam = {
  type: string
  default?: string | number | boolean
  label?: string
  options?: string[]
  min?: number
  max?: number
  step?: number
}

type ParamsFile = { params?: Record<string, RawParam> }

function toKnobKind(raw: string): KnobKind {
  switch (raw) {
    case "choice":
      return "choice"
    case "range":
      return "range"
    case "toggle":
      return "toggle"
    case "color":
      return "color"
    default:
      return "choice"
  }
}

export function schemaToKnobs(schema: ParamsFile): KnobDef[] {
  const params = schema.params ?? {}
  return Object.entries(params).map(([key, p]) => {
    const kind = toKnobKind(p.type)
    const def: KnobDef = {
      key,
      kind,
      label: p.label ?? key,
      default: p.default ?? (kind === "toggle" ? false : kind === "range" ? 0 : ""),
    }
    if (p.options) def.options = p.options
    if (p.min !== undefined) def.min = p.min
    if (p.max !== undefined) def.max = p.max
    if (p.step !== undefined) def.step = p.step
    return def
  })
}

export function defaultKnobValues(knobs: KnobDef[]): KnobValues {
  return Object.fromEntries(knobs.map((k) => [k.key, k.default]))
}

export function mergeKnobValues(
  knobs: KnobDef[],
  patch: Partial<KnobValues>
): KnobValues {
  const base = defaultKnobValues(knobs)
  for (const k of knobs) {
    if (patch[k.key] !== undefined) base[k.key] = patch[k.key]!
  }
  return base
}

export function paramsUrlForAsset(assetId: string, live: boolean): string {
  if (live) return `https://polyfork.dev/cdn/${assetId}-params.json`
  return `/data/${assetId}-params.json`
}