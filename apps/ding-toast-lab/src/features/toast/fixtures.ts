/** Deterministic offline promise simulation timings (ms). */
export const PROMISE_RESOLVE_MS = 1400
export const PROMISE_REJECT_MS = 1100
export const PROGRESS_TICK_MS = 220
export const DISMISS_AFTER_MS = 4500

export type PromiseOutcome = "resolve" | "reject"

export function progressAfterTick(current: number, step = 18): number {
  return Math.min(100, current + step)
}

export function promiseLabel(outcome: PromiseOutcome): string {
  return outcome === "resolve" ? "Saving draft…" : "Deleting item…"
}
