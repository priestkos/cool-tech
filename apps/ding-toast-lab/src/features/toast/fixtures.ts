/** Deterministic offline promise simulation timings (ms). */
export const PROMISE_RESOLVE_MS = 1400
export const PROMISE_REJECT_MS = 1100
export const PROGRESS_TICK_MS = 220

export type PromiseOutcome = "resolve" | "reject"

export function promiseTask(outcome: PromiseOutcome): Promise<string> {
  const delay = outcome === "resolve" ? PROMISE_RESOLVE_MS : PROMISE_REJECT_MS
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (outcome === "resolve") resolve("draft")
      else reject(new Error("fixture reject"))
    }, delay)
  })
}

export function promiseMessages(outcome: PromiseOutcome) {
  if (outcome === "resolve") {
    return {
      loading: "Saving draft…",
      success: "Draft saved",
      error: (err: unknown) =>
        `Save failed: ${err instanceof Error ? err.message : "unknown"}`,
    }
  }
  return {
    loading: "Deleting item…",
    success: "Deleted",
    error: (err: unknown) =>
      `Delete failed: ${err instanceof Error ? err.message : "unknown"}`,
  }
}