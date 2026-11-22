import { describe, expect, test } from "vitest"
import { encodeWav } from "@/lib/wav"

describe("encodeWav", () => {
  test("produces a RIFF WAV header and 16-bit PCM", () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1, -1])
    const blob = encodeWav(samples, 24_000)
    expect(blob.type).toBe("audio/wav")
    expect(blob.size).toBe(44 + samples.length * 2)
  })
})