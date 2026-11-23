import { describe, expect, test } from "vitest"
import {
  MAX_HISTORY,
  pushHistory,
  type GenerationRecord,
} from "@/lib/generation-types"

function record(id: string): GenerationRecord {
  return {
    id,
    text: id,
    language: "en",
    createdAt: 0,
    sampleRate: 24_000,
    samples: new Float32Array(0),
    rtf: 0,
    generationMs: 0,
    audioSeconds: 0,
  }
}

describe("pushHistory", () => {
  test("keeps newest first and drops entries past the cap", () => {
    const prev = ["a", "b", "c", "d", "e"].map(record)
    const next = pushHistory(prev, record("f"))
    expect(MAX_HISTORY).toBe(5)
    expect(prev.map((r) => r.id)).toEqual(["a", "b", "c", "d", "e"])
    expect(next.map((r) => r.id)).toEqual(["f", "a", "b", "c", "d"])
    expect(next).not.toBe(prev)
  })

  test("returns a one-item list when history was empty", () => {
    const entry = record("solo")
    expect(pushHistory([], entry)).toEqual([entry])
  })
})
