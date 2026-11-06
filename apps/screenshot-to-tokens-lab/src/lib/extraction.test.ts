import { describe, expect, test } from "bun:test"
import {
  advanceExtraction,
  cancelExtraction,
  EXTRACTION_STAGES,
  initialExtractionState,
  startExtraction,
} from "./extraction"

describe("mock extraction state machine", () => {
  test("runs stages to done", () => {
    let state = startExtraction(initialExtractionState())
    expect(state.phase).toBe("running")
    for (let i = 0; i < EXTRACTION_STAGES.length; i += 1) {
      state = advanceExtraction(state)
    }
    expect(state.phase).toBe("done")
  })

  test("cancel is idempotent when idle", () => {
    const idle = initialExtractionState()
    expect(cancelExtraction(idle)).toEqual(idle)
  })

  test("re-run increments run id", () => {
    const first = startExtraction(initialExtractionState())
    const second = startExtraction(first)
    expect(second.runId).toBe(first.runId + 1)
  })
})
