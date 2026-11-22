import { describe, expect, test } from "vitest"
import { validateReferenceDuration } from "@/lib/reference-audio"

describe("validateReferenceDuration", () => {
  test("rejects clips shorter than 3s", () => {
    const samples = new Float32Array(24_000 * 2)
    const result = validateReferenceDuration(samples, 24_000)
    expect(result.ok).toBe(false)
  })

  test("accepts 5s clip", () => {
    const samples = new Float32Array(24_000 * 5)
    expect(validateReferenceDuration(samples, 24_000).ok).toBe(true)
  })

  test("rejects clips longer than 10s", () => {
    const samples = new Float32Array(24_000 * 11)
    expect(validateReferenceDuration(samples, 24_000).ok).toBe(false)
  })
})