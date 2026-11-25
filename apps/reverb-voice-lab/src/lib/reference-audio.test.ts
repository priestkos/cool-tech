import { describe, expect, test } from "vitest"
import { trimToMaxReference, validateReferenceDuration } from "@/lib/reference-audio"
import {
  REFERENCE_MAX_SECONDS,
  REFERENCE_MIN_SECONDS,
  REVERB_SAMPLE_RATE,
} from "@/lib/reverb-config"

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

describe("reference bounds", () => {
  test("accepts clips on the inclusive 3s and 10s edges", () => {
    const min = new Float32Array(REVERB_SAMPLE_RATE * REFERENCE_MIN_SECONDS)
    const max = new Float32Array(REVERB_SAMPLE_RATE * REFERENCE_MAX_SECONDS)
    expect(validateReferenceDuration(min, REVERB_SAMPLE_RATE).ok).toBe(true)
    expect(validateReferenceDuration(max, REVERB_SAMPLE_RATE).ok).toBe(true)
  })

  test("rejects a clip one sample under 3s", () => {
    const samples = new Float32Array(REVERB_SAMPLE_RATE * REFERENCE_MIN_SECONDS - 1)
    const result = validateReferenceDuration(samples, REVERB_SAMPLE_RATE)
    expect(result.ok).toBe(false)
  })
})

describe("trimToMaxReference", () => {
  test("returns the same array when the clip is already within 10s", () => {
    const samples = new Float32Array(REVERB_SAMPLE_RATE * REFERENCE_MAX_SECONDS)
    expect(trimToMaxReference(samples, REVERB_SAMPLE_RATE)).toBe(samples)
  })

  test("slices an over-long clip to exactly 10s so validation can pass", () => {
    const samples = new Float32Array(REVERB_SAMPLE_RATE * REFERENCE_MAX_SECONDS + 50)
    samples[0] = 0.25
    const trimmed = trimToMaxReference(samples, REVERB_SAMPLE_RATE)
    expect(trimmed.length).toBe(REVERB_SAMPLE_RATE * REFERENCE_MAX_SECONDS)
    expect(trimmed).not.toBe(samples)
    expect(trimmed[0]).toBe(0.25)
    expect(validateReferenceDuration(trimmed, REVERB_SAMPLE_RATE).ok).toBe(true)
  })
})