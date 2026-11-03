import { deepCloneSpec } from "./keyframes"
import { computeCheckRows } from "./metrics"
import type { AnimationSpec, CheckRow } from "./types"

const MAX_PASSES = 5

function stepToward(current: number, target: number, maxStep: number): number {
  const delta = target - current
  if (Math.abs(delta) <= maxStep) return target
  return current + Math.sign(delta) * maxStep
}

function worstRow(rows: CheckRow[]): CheckRow | null {
  const failing = rows.filter((r) => !r.pass)
  if (failing.length === 0) return null
  return failing.reduce((a, b) => (b.failure > a.failure ? b : a))
}

export type NextPassResult = {
  spec: AnimationSpec
  row: CheckRow | null
  blocked: boolean
  reason?: string
}

export function applyNextPass(
  copy: AnimationSpec,
  reference: AnimationSpec,
  refTracks: ReturnType<typeof import("./keyframes").buildSyntheticTrack>,
  copyTracks: ReturnType<typeof import("./keyframes").buildSyntheticTrack>,
  passCount: number,
): NextPassResult {
  if (passCount >= MAX_PASSES) {
    return { spec: copy, row: null, blocked: true, reason: "Stopped after 5 passes." }
  }

  const rows = computeCheckRows(reference, copy, refTracks, copyTracks)
  const worst = worstRow(rows)
  if (!worst) {
    return { spec: copy, row: null, blocked: true, reason: "All rows pass." }
  }

  const next = deepCloneSpec(copy)

  switch (worst.kind) {
    case "start":
    case "end":
    case "duration":
      next.delayMs = Math.round(stepToward(next.delayMs, reference.delayMs, 40))
      next.durationMs = Math.round(stepToward(next.durationMs, reference.durationMs, 60))
      break
    case "easing": {
      const refPoints =
        reference.easing.kind === "linear"
          ? ([0, 0, 1, 1] as const)
          : reference.easing.points
      if (next.easing.kind === "linear") {
        next.easing = { kind: "cubic-bezier", points: [...refPoints] }
      } else {
        const np = next.easing.points
        next.easing = {
          kind: "cubic-bezier",
          points: [
            stepToward(np[0], refPoints[0], 0.08),
            stepToward(np[1], refPoints[1], 0.08),
            stepToward(np[2], refPoints[2], 0.08),
            stepToward(np[3], refPoints[3], 0.08),
          ],
        }
      }
      break
    }
    default: {
      if (worst.kind.startsWith("travel-")) {
        const prop = worst.kind.replace("travel-", "") as "translateY" | "opacity" | "scale"
        next.keyframes = next.keyframes.map((kf) => {
          const refKf = reference.keyframes.reduce((best, candidate) =>
            Math.abs(candidate.offset - kf.offset) < Math.abs(best.offset - kf.offset)
              ? candidate
              : best,
          )
          return {
            ...kf,
            [prop]: stepToward(kf[prop], refKf[prop], prop === "opacity" ? 0.05 : 4),
          }
        })
      }
      break
    }
  }

  return { spec: next, row: worst, blocked: false }
}

export { MAX_PASSES }
