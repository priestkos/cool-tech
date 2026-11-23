import type { ThinkingState } from "@/zen-sand/types"

export const STATE_HOLD_MS = 3500

export type AgentStep = {
  state: ThinkingState
  log: string
}

export const AGENT_SEQUENCE: readonly AgentStep[] = [
  { state: "thinking", log: "Thinking…" },
  { state: "searching", log: "Searching…" },
  { state: "tool", log: "Using a tool…" },
  { state: "writing", log: "Writing…" },
  { state: "idle", log: "Ready" },
] as const

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"))
      return
    }
    const id = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort)
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"))
      } else {
        resolve()
      }
    }, ms)
    const onAbort = () => {
      window.clearTimeout(id)
      reject(new DOMException("Aborted", "AbortError"))
    }
    signal.addEventListener("abort", onAbort, { once: true })
  })
}

export type AgentRunCallbacks = {
  onStep: (step: AgentStep) => void
}

/** Drives thinking states in order; honors `signal` and holds each working state for STATE_HOLD_MS. */
export async function runAgentSequence(
  callbacks: AgentRunCallbacks,
  signal: AbortSignal,
): Promise<void> {
  for (const step of AGENT_SEQUENCE) {
    if (signal.aborted) return
    callbacks.onStep(step)
    if (step.state !== "idle") {
      await delay(STATE_HOLD_MS, signal)
    }
  }
}