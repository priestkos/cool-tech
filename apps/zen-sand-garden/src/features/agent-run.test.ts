import { describe, expect, test } from "bun:test"
import {
  AGENT_SEQUENCE,
  STATE_HOLD_MS,
  runAgentSequence,
} from "./agent-run"

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
})