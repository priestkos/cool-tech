import type { CubicBezier, Easing } from "./types"

export const NAMED_EASINGS: Record<string, CubicBezier> = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  "ease-in": [0.42, 0, 1, 1],
  "ease-out": [0, 0, 0.58, 1],
  "ease-in-out": [0.42, 0, 0.58, 1],
  "ease-out-expo": [0.16, 1, 0.3, 1],
  "ease-out-back": [0.34, 1.56, 0.64, 1],
}

function cubicAt(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
}

function cubicDerivativeAt(t: number, p0: number, p1: number, p2: number, p3: number): number {
  const u = 1 - t
  return (
    3 * u * u * (p1 - p0) + 6 * u * t * (p2 - p1) + 3 * t * t * (p3 - p2)
  )
}

/** Given x in [0,1] on the bezier time axis, return y on the easing curve. */
export function sampleCubicBezierY(x: number, points: CubicBezier): number {
  const clamped = Math.min(1, Math.max(0, x))
  if (clamped === 0) return 0
  if (clamped === 1) return 1

  const [x1, y1, x2, y2] = points
  let t = clamped
  for (let i = 0; i < 8; i++) {
    const xAtT = cubicAt(t, 0, x1, x2, 1)
    const dx = cubicDerivativeAt(t, 0, x1, x2, 1)
    if (Math.abs(dx) < 1e-8) break
    t -= (xAtT - clamped) / dx
    t = Math.min(1, Math.max(0, t))
  }
  return cubicAt(t, 0, y1, y2, 1)
}

export function easingPoints(easing: Easing): CubicBezier {
  switch (easing.kind) {
    case "linear":
      return NAMED_EASINGS.linear
    case "cubic-bezier":
      return easing.points
    case "named":
      return easing.points
    default: {
      const _exhaustive: never = easing
      return _exhaustive
    }
  }
}

export function applyEasing(progress: number, easing: Easing): number {
  const p = Math.min(1, Math.max(0, progress))
  if (easing.kind === "linear") return p
  return sampleCubicBezierY(p, easingPoints(easing))
}

export function easingToCss(easing: Easing): string {
  switch (easing.kind) {
    case "linear":
      return "linear"
    case "named": {
      // Only use the name directly if it's a standard CSS easing
      const standardEasings = ["ease", "ease-in", "ease-out", "ease-in-out", "linear"]
      if (standardEasings.includes(easing.name)) {
        return easing.name
      }
      // Otherwise, convert to cubic-bezier
      const [x1, y1, x2, y2] = easing.points
      return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`
    }
    case "cubic-bezier": {
      const [x1, y1, x2, y2] = easing.points
      return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`
    }
    default: {
      const _exhaustive: never = easing
      return _exhaustive
    }
  }
}

export function easingFamily(points: CubicBezier): string {
  const [, y1, , y2] = points
  if (points[0] === 0 && points[1] === 0 && points[2] === 1 && points[3] === 1) {
    return "linear"
  }
  if (y1 > 0.55 && y2 > 0.85) return "out"
  if (y1 < 0.15 && y2 < 0.45) return "in"
  if (y1 < 0.45 && y2 > 0.55) return "in-out"
  return "custom"
}
