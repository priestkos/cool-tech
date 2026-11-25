import { describe, expect, test } from "vitest"
import { encodeWav } from "@/lib/wav"

describe("encodeWav", () => {
  test("produces a RIFF WAV header and 16-bit PCM", () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1, -1])
    const blob = encodeWav(samples, 24_000)
    expect(blob.type).toBe("audio/wav")
    expect(blob.size).toBe(44 + samples.length * 2)
  })

  test("writes a mono 16-bit header and clamps samples into [-1, 1]", async () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1, -1, 2, -2])
    const blob = encodeWav(samples, 24_000)
    const view = new DataView(await blob.arrayBuffer())
    const fourcc = (offset: number) =>
      String.fromCharCode(
        view.getUint8(offset),
        view.getUint8(offset + 1),
        view.getUint8(offset + 2),
        view.getUint8(offset + 3),
      )

    expect(fourcc(0)).toBe("RIFF")
    expect(fourcc(8)).toBe("WAVE")
    expect(fourcc(12)).toBe("fmt ")
    expect(view.getUint16(22, true)).toBe(1)
    expect(view.getUint32(24, true)).toBe(24_000)
    expect(view.getUint16(34, true)).toBe(16)

    const pcm = Array.from({ length: samples.length }, (_, i) =>
      view.getInt16(44 + i * 2, true),
    )
    expect(pcm).toEqual([0, 16383, -16384, 32767, -32768, 32767, -32768])
  })
})