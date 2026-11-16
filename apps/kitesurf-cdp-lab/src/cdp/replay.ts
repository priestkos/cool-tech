import { assertReplayOrder } from "./framing"
import type { TranscriptEntry } from "./types"

export type ReplaySnapshot = {
  index: number
  visible: TranscriptEntry[]
  elapsedMs: number
}

export function sliceTranscript(entries: TranscriptEntry[], index: number): ReplaySnapshot {
  assertReplayOrder(entries)
  const clamped = Math.max(0, Math.min(index, entries.length - 1))
  const visible = entries.slice(0, clamped + 1)
  const elapsedMs = visible.length ? visible[visible.length - 1].atMs : 0
  return { index: clamped, visible, elapsedMs }
}

export function replayToTime(entries: TranscriptEntry[], atMs: number): ReplaySnapshot {
  assertReplayOrder(entries)
  let index = 0
  for (let i = 0; i < entries.length; i++) {
    if (entries[i].atMs <= atMs) index = i
    else break
  }
  return sliceTranscript(entries, index)
}

export function findResponseForRequest(
  entries: TranscriptEntry[],
  requestId: number,
  upToIndex: number
) {
  const slice = entries.slice(0, upToIndex + 1)
  return slice.find(
    (e) =>
      e.direction === "response" &&
      "id" in e.payload &&
      e.payload.id === requestId
  )
}