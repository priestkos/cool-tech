import { describe, expect, test } from "bun:test"
import { replayToTime, sliceTranscript } from "./replay"
import { AGENT_TASK_TRANSCRIPT, PAGE_LOAD_TRANSCRIPTS } from "../fixtures/transcripts"

describe("sliceTranscript", () => {
  test("scrubs to index and preserves order", () => {
    const entries = PAGE_LOAD_TRANSCRIPTS["kite-intro"]
    const snap = sliceTranscript(entries, 4)
    expect(snap.visible).toHaveLength(5)
    expect(snap.visible[0].atMs).toBeLessThanOrEqual(snap.visible[4].atMs)
    expect(snap.elapsedMs).toBe(entries[4].atMs)
  })

  test("clamps index bounds", () => {
    const entries = AGENT_TASK_TRANSCRIPT
    expect(sliceTranscript(entries, 999).index).toBe(entries.length - 1)
    expect(sliceTranscript(entries, -3).index).toBe(0)
  })
})

describe("replayToTime", () => {
  test("replays through timestamp", () => {
    const snap = replayToTime(AGENT_TASK_TRANSCRIPT, 100)
    expect(snap.visible.every((e) => e.atMs <= 100)).toBe(true)
    expect(snap.visible[snap.visible.length - 1].atMs).toBeLessThanOrEqual(100)
  })
})