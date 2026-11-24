import { describe, expect, test } from "bun:test"
import {
  AGENT_SEQUENCE,
  STATE_HOLD_MS,
  logForThinkingState,
  runAgentSequence,
} from "./agent-run"

// Delays use window.setTimeout. Bun's runner has the real timers on globalThis
// and no window object; alias window so holds sleep for real instead of throwing.
if (typeof globalThis.window === "undefined") {
  Object.assign(globalThis, { window: globalThis })
}

describe("agent-run", () => {
  test("sequence order and labels", () => {
    expect(AGENT_SEQUENCE.map((s) => s.state)).toEqual([
      "thinking",
      "searching",
      "tool",
      "writing",
      "idle",
    ])
    expect(AGENT_SEQUENCE[0].log).toBe("Thinking…")
    expect(AGENT_SEQUENCE.at(-1)?.log).toBe("Ready")
  })

  test("STATE_HOLD_MS is at least 3 seconds", () => {
    expect(STATE_HOLD_MS).toBeGreaterThanOrEqual(3000)
  })

  test("runAgentSequence aborts cleanly", async () => {
    const controller = new AbortController()
    const logs: string[] = []
    const run = runAgentSequence(
      {
        onStep: (step) => logs.push(step.log),
      },
      controller.signal,
    )
    controller.abort()
    await expect(run).rejects.toThrow()
    expect(logs.length).toBeLessThanOrEqual(1)
  })

  test("every ThinkingState log equals logForThinkingState and the five logs are unique", () => {
    const states = ["thinking", "searching", "tool", "writing", "idle"] as const
    const logs = states.map((state) => {
      const step = AGENT_SEQUENCE.find((item) => item.state === state)
      expect(step?.log).toBe(logForThinkingState(state))
      return logForThinkingState(state)
    })
    expect(new Set(logs).size).toBe(5)
  })

  test("already-aborted signal records nothing and resolves", async () => {
    const controller = new AbortController()
    controller.abort()
    const states: string[] = []
    const run = runAgentSequence(
      {
        onStep: (step) => states.push(step.state),
      },
      controller.signal,
    )
    await expect(run).resolves.toBeUndefined()
    expect(states).toEqual([])
  })

  test("abort inside the first onStep rejects AbortError after thinking only", async () => {
    const controller = new AbortController()
    const states: string[] = []
    const run = runAgentSequence(
      {
        onStep: (step) => {
          states.push(step.state)
          controller.abort()
        },
      },
      controller.signal,
    )
    try {
      await run
      throw new Error("expected AbortError")
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).name).toBe("AbortError")
    }
    expect(states).toEqual(["thinking"])
  })

  test("short hold visits every state", async () => {
    const controller = new AbortController()
    const states: string[] = []
    const started = performance.now()
    await runAgentSequence(
      {
        onStep: (step) => states.push(step.state),
      },
      controller.signal,
      30,
    )
    const elapsed = performance.now() - started
    expect(states).toEqual(["thinking", "searching", "tool", "writing", "idle"])
    expect(elapsed).toBeGreaterThanOrEqual(100)
  })
})