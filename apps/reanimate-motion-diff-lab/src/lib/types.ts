export type CubicBezier = [number, number, number, number]

export type Easing =
  | { kind: "linear" }
  | { kind: "cubic-bezier"; points: CubicBezier }
  | { kind: "named"; name: string; points: CubicBezier }

export type KeyframePoint = {
  offset: number
  translateY: number
  opacity: number
  scale: number
}

export type AnimationSpec = {
  delayMs: number
  durationMs: number
  easing: Easing
  keyframes: KeyframePoint[]
}

export type MotionProperty = "translateY" | "opacity" | "scale"

export type TimeValue = { timeMs: number; value: number }

export type PropertyTracks = Record<MotionProperty, TimeValue[]>

export type CheckKind =
  | "start"
  | "end"
  | "duration"
  | "easing"
  | "travel-translateY"
  | "travel-opacity"
  | "travel-scale"

export type CheckRow = {
  id: string
  kind: CheckKind
  label: string
  pass: boolean
  detail: string
  failure: number
  weight: number
}

export type PassHistoryEntry = {
  passIndex: number
  score: number
  summary: string
  spec: AnimationSpec
}

export type ReferencePreset = {
  id: string
  label: string
  description: string
  reference: AnimationSpec
  /** Deliberately mismatched starting copy for the demo loop */
  initialCopy: AnimationSpec
}

export const TIMING_THRESHOLD_S = 0.08
export const EASING_RMSE_THRESHOLD = 0.05
export const TRAVEL_THRESHOLD_RATIO = 0.1

export const SCORE_FORMULA = `overall = round(100 × (1 − weightedFailure))
weightedFailure = Σ(row.weight × clamp(failure, 0, 1)) / Σ(row.weight)
timing failure = max(|Δstart|, |Δend|, |Δduration|) / ${TIMING_THRESHOLD_S}
easing failure = rmse / ${EASING_RMSE_THRESHOLD}
travel failure = |Δtravel%| / ${TRAVEL_THRESHOLD_RATIO * 100}`
