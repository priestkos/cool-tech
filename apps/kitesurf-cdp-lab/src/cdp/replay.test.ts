import { describe, expect, test } from "bun:test"
import { findResponseForRequest, replayToTime, sliceTranscript } from "./replay"
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

  test("includes every entry at the exact timestamp", () => {
    const entries = [
      { atMs: 0, direction: "event" as const, payload: { method: "a" } },
      { atMs: 50, direction: "event" as const, payload: { method: "b" } },
      { atMs: 50, direction: "event" as const, payload: { method: "c" } },
      { atMs: 80, direction: "event" as const, payload: { method: "d" } },
    ]
    const snap = replayToTime(entries, 50)
    expect(snap.visible.map((entry) => entry.payload)).toEqual([
      { method: "a" },
      { method: "b" },
      { method: "c" },
    ])
    expect(snap.elapsedMs).toBe(50)
  })

  test("empty transcript scrubs to nothing", () => {
    expect(sliceTranscript([], 0)).toEqual({ index: 0, visible: [], elapsedMs: 0 })
  })
})

describe("findResponseForRequest", () => {
  test("hides responses that are still past the scrub index", () => {
    const entries = [
      {
        atMs: 0,
        direction: "request" as const,
        payload: { id: 3, method: "Page.captureScreenshot" },
      },
      {
        atMs: 10,
        direction: "response" as const,
        payload: { id: 3, result: { data: "AAA" } },
      },
    ]
    expect(findResponseForRequest(entries, 3, 0)).toBeUndefined()
    expect(findResponseForRequest(entries, 3, 1)?.payload).toEqual({
      id: 3,
      result: { data: "AAA" },
    })
    expect(findResponseForRequest(entries, 99, 1)).toBeUndefined()
  })
})