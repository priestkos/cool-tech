import { applyEasing } from "./bezier"
import type { AnimationSpec, MotionProperty, TimeValue } from "./types"

function sortedKeyframes(spec: AnimationSpec) {
  return [...spec.keyframes].sort((a, b) => a.offset - b.offset)
}

export function interpolateProperty(
  spec: AnimationSpec,
  timeMs: number,
  property: MotionProperty,
): number {
  const { delayMs, durationMs } = spec
  const kfs = sortedKeyframes(spec)
  if (kfs.length === 0) return 0

  if (timeMs <= delayMs) return kfs[0][property]
  const endMs = delayMs + durationMs
  if (timeMs >= endMs) return kfs[kfs.length - 1][property]

  const rawProgress = (timeMs - delayMs) / durationMs
  const eased = applyEasing(rawProgress, spec.easing)

  let left = kfs[0]
  let right = kfs[kfs.length - 1]
  for (let i = 0; i < kfs.length - 1; i++) {
    if (eased >= kfs[i].offset && eased <= kfs[i + 1].offset) {
      left = kfs[i]
      right = kfs[i + 1]
      break
    }
  }

  const span = right.offset - left.offset
  const local = span <= 1e-9 ? 0 : (eased - left.offset) / span
  return left[property] + (right[property] - left[property]) * local
}

export function buildSyntheticTrack(
  spec: AnimationSpec,
  fps: number,
  totalMs: number,
): Record<MotionProperty, TimeValue[]> {
  const step = 1000 / fps
  const tracks: Record<MotionProperty, TimeValue[]> = {
    translateY: [],
    opacity: [],
    scale: [],
  }
  for (let t = 0; t <= totalMs + 0.001; t += step) {
    const timeMs = Math.round(t * 1000) / 1000
    for (const prop of ["translateY", "opacity", "scale"] as const) {
      tracks[prop].push({ timeMs, value: interpolateProperty(spec, timeMs, prop) })
    }
  }
  return tracks
}

export function deepCloneSpec(spec: AnimationSpec): AnimationSpec {
  let easing = spec.easing
  if (easing.kind === "cubic-bezier" || easing.kind === "named") {
    easing = { ...easing, points: [...easing.points] as [number, number, number, number] }
  }
  return {
    delayMs: spec.delayMs,
    durationMs: spec.durationMs,
    easing,
    keyframes: spec.keyframes.map((k) => ({ ...k })),
  }
}
