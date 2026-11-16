import { describe, expect, test } from "bun:test"
import {
  createStepLogState,
  entryAtIndex,
  setScrubIndex,
  stepLogRoundTrip,
} from "./step-log-state"
import { AGENT_TASK_TRANSCRIPT } from "../fixtures/transcripts"

describe("step log state", () => {
  test("round-trips JSON", () => {
    const initial = createStepLogState("agent-walk", AGENT_TASK_TRANSCRIPT.length)
    expect(stepLogRoundTrip(initial)).toEqual(initial)
  })

  test("clamps scrub index", () => {
    const state = createStepLogState("agent-walk", 5)
    const next = setScrubIndex(state, 99, 4)
    expect(next.scrubIndex).toBe(4)
    expect(entryAtIndex(AGENT_TASK_TRANSCRIPT, next.scrubIndex)?.atMs).toBe(58)
  })
})