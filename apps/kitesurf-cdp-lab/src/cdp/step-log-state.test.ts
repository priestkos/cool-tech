import { describe, expect, test } from "bun:test"
import {
  createStepLogState,
  entryAtIndex,
  parseStepLogState,
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

  test("rejects invalid persisted state", () => {
    expect(() => parseStepLogState("not-json")).toThrow()
    expect(() => parseStepLogState("null")).toThrow(/Invalid step log state/)
    expect(() =>
      parseStepLogState(JSON.stringify({ transcriptId: 1, scrubIndex: 0, autoPlay: false })),
    ).toThrow(/Invalid step log state/)
    expect(() =>
      parseStepLogState(JSON.stringify({ transcriptId: "a", scrubIndex: 0, autoPlay: "false" })),
    ).toThrow(/fields/)
  })

  test("clamps an empty log and out-of-range reads", () => {
    expect(createStepLogState("walk", 0).scrubIndex).toBe(0)
    expect(setScrubIndex(createStepLogState("walk", 4), -5, 3).scrubIndex).toBe(0)
    expect(entryAtIndex([], 0)).toBeUndefined()
    expect(entryAtIndex(AGENT_TASK_TRANSCRIPT, -1)).toBeUndefined()
    expect(entryAtIndex(AGENT_TASK_TRANSCRIPT, 10_000)).toBeUndefined()
  })
})