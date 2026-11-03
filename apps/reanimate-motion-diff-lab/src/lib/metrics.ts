import { easingPoints, sampleCubicBezierY } from "./bezier"
import type { AnimationSpec, CheckRow, MotionProperty, TimeValue } from "./types"
import {
  EASING_RMSE_THRESHOLD as EASE_THRESH,
  TIMING_THRESHOLD_S as TIME_THRESH,
  TRAVEL_THRESHOLD_RATIO as TRAVEL_THRESH,
} from "./types"

const EPS = 1e-4

function valueAt(track: TimeValue[], timeMs: number): number {
  if (track.length === 0) return 0
  let prev = track[0]
  for (const point of track) {
    if (point.timeMs > timeMs) break
    prev = point
  }
  return prev.value
}

export function detectMotionWindow(track: TimeValue[]): {
  startMs: number
  endMs: number
  durationMs: number
} {
  if (track.length < 2) {
    return { startMs: 0, endMs: 0, durationMs: 0 }
  }
  const rest = track[0].value
  let startMs = track[0].timeMs
  let endMs = track[track.length - 1].timeMs
  for (const point of track) {
    if (Math.abs(point.value - rest) > EPS) {
      startMs = point.timeMs
      break
    }
  }
  const final = track[track.length - 1].value
  for (let i = track.length - 1; i >= 0; i--) {
    if (Math.abs(track[i].value - final) > EPS) {
      endMs = track[i].timeMs
      break
    }
  }
  return { startMs, endMs, durationMs: Math.max(0, endMs - startMs) }
}

function travelDistance(track: TimeValue[]): number {
  if (track.length === 0) return 0
  const start = track[0].value
  const end = track[track.length - 1].value
  return Math.abs(end - start)
}

export function easingRmse(
  refTrack: TimeValue[],
  copyTrack: TimeValue[],
  refSpec: AnimationSpec,
): number {
  const refStart = valueAt(refTrack, refSpec.delayMs)
  const refEnd = valueAt(refTrack, refSpec.delayMs + refSpec.durationMs)
  const delta = refEnd - refStart
  if (Math.abs(delta) < EPS) return 0

  const points = easingPoints(refSpec.easing)
  let sum = 0
  const samples = 40
  for (let i = 0; i <= samples; i++) {
    const u = i / samples
    const t = refSpec.delayMs + u * refSpec.durationMs
    const copyVal = valueAt(copyTrack, t)
    const copyNorm = (copyVal - refStart) / delta
    const expected = sampleCubicBezierY(u, points)
    const err = copyNorm - expected
    sum += err * err
  }
  return Math.sqrt(sum / (samples + 1))
}

export function computeCheckRows(
  refSpec: AnimationSpec,
  copySpec: AnimationSpec,
  refTracks: Record<MotionProperty, TimeValue[]>,
  copyTracks: Record<MotionProperty, TimeValue[]>,
): CheckRow[] {
  const rows: CheckRow[] = []
  const refStartMs = refSpec.delayMs
  const refEndMs = refSpec.delayMs + refSpec.durationMs
  const copyStartMs = copySpec.delayMs
  const copyEndMs = copySpec.delayMs + copySpec.durationMs

  const startErr = Math.abs(copyStartMs - refStartMs) / 1000
  const endErr = Math.abs(copyEndMs - refEndMs) / 1000
  const durErr = Math.abs(copySpec.durationMs - refSpec.durationMs) / 1000

  rows.push({
    id: "start",
    kind: "start",
    label: "Start timing",
    pass: startErr <= TIME_THRESH,
    detail: `Δ ${(startErr * 1000).toFixed(0)} ms (≤ ${TIME_THRESH * 1000} ms)`,
    failure: startErr / TIME_THRESH,
    weight: 1.2,
  })
  rows.push({
    id: "end",
    kind: "end",
    label: "End timing",
    pass: endErr <= TIME_THRESH,
    detail: `Δ ${(endErr * 1000).toFixed(0)} ms (≤ ${TIME_THRESH * 1000} ms)`,
    failure: endErr / TIME_THRESH,
    weight: 1.2,
  })
  rows.push({
    id: "duration",
    kind: "duration",
    label: "Duration",
    pass: durErr <= TIME_THRESH,
    detail: `Δ ${(durErr * 1000).toFixed(0)} ms (≤ ${TIME_THRESH * 1000} ms)`,
    failure: durErr / TIME_THRESH,
    weight: 1.2,
  })

  const rmse = easingRmse(refTracks.translateY, copyTracks.translateY, refSpec)
  rows.push({
    id: "easing",
    kind: "easing",
    label: "Easing curve (translateY)",
    pass: rmse <= EASE_THRESH,
    detail: `RMSE ${rmse.toFixed(3)} (≤ ${EASE_THRESH})`,
    failure: rmse / EASE_THRESH,
    weight: 1.5,
  })

  for (const prop of ["translateY", "opacity", "scale"] as const) {
    const refTravel = travelDistance(refTracks[prop])
    const copyTravel = travelDistance(copyTracks[prop])
    const pct =
      refTravel < EPS ? 0 : (Math.abs(copyTravel - refTravel) / refTravel) * 100
    rows.push({
      id: `travel-${prop}`,
      kind: `travel-${prop}` as CheckRow["kind"],
      label: `Travel ${prop}`,
      pass: pct <= TRAVEL_THRESH * 100,
      detail: `Δ ${pct.toFixed(1)}% (≤ ${TRAVEL_THRESH * 100}%)`,
      failure: pct / (TRAVEL_THRESH * 100),
      weight: 1,
    })
  }

  return rows
}

export function specTableRows(spec: AnimationSpec) {
  const kfs = [...spec.keyframes].sort((a, b) => a.offset - b.offset)
  const from = kfs[0]
  const to = kfs[kfs.length - 1]
  const easingLabel =
    spec.easing.kind === "linear"
      ? "linear"
      : spec.easing.kind === "named"
        ? spec.easing.name
        : `cubic-bezier(${spec.easing.points.join(", ")})`

  return (["translateY", "opacity", "scale"] as const).map((prop) => ({
    property: prop,
    startMs: spec.delayMs,
    durationMs: spec.durationMs,
    from: from[prop],
    to: to[prop],
    easing: easingLabel,
  }))
}
