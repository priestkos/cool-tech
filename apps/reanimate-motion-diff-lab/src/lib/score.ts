import type { CheckRow } from "./types"

export function computeOverallScore(rows: CheckRow[]): number {
  if (rows.length === 0) return 100
  let weightSum = 0
  let failureSum = 0
  for (const row of rows) {
    const raw = Math.min(1, Math.max(0, row.failure))
    const clamped = row.pass ? 0 : raw
    weightSum += row.weight
    failureSum += row.weight * clamped
  }
  const weightedFailure = failureSum / weightSum
  return Math.round(100 * (1 - weightedFailure))
}

export function allRowsPass(rows: CheckRow[]): boolean {
  return rows.every((r) => r.pass)
}
