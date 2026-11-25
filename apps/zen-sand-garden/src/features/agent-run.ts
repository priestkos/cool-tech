import type { ThinkingState } from "@/zen-sand/types"

export const STATE_HOLD_MS = 3500

export type AgentStep = {
  state: ThinkingState
  log: string
}

export function logForThinkingState(state: ThinkingState): string {
  switch (state) {
    case "thinking":
      return "Thinking…"
    case "searching":
      return "Searching…"
    case "tool":
      return "Using a tool…"
    case "writing":
      return "Writing…"
    case "idle":
      return "Ready"
    default: {
      const _exhaustive: never = state
      return _exhaustive
    }
  }
}

const SEQUENCE_STATES = ["thinking", "searching", "tool", "writing", "idle"] as const

export const AGENT_SEQUENCE: readonly AgentStep[] = SEQUENCE_STATES.map((state) => ({
  state,
  log: logForThinkingState(state),
}))

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
  holdMs: number = STATE_HOLD_MS,
): Promise<void> {
  for (const step of AGENT_SEQUENCE) {
    if (signal.aborted) return
    callbacks.onStep(step)
    if (step.state !== "idle") {
      await delay(holdMs, signal)
    }
  }
}