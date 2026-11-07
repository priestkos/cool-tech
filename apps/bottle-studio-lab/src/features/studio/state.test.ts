import { describe, expect, test } from "bun:test"
import {
  DEFAULT_STUDIO_STATE,
  applySilhouettePreset,
  clamp,
  clampStudioState,
  mergeStudioState,
  resetStudioState,
} from "./state"

describe("studio state", () => {
  test("clamp bounds numbers", () => {
    expect(clamp(5, 0, 3)).toBe(3)
    expect(clamp(-1, 0, 3)).toBe(0)
  })

  test("clampStudioState enforces ranges", () => {
    const next = clampStudioState({
      ...DEFAULT_STUDIO_STATE,
      bodyWidth: 9,
      fillAmount: 2,
      lightAzimuth: 500,
      wordmark: "x".repeat(80),
    })
    expect(next.bodyWidth).toBe(1.45)
    expect(next.fillAmount).toBe(1)
    expect(next.lightAzimuth).toBe(360)
    expect(next.wordmark.length).toBe(48)
  })

  test("silhouette preset updates shape dims", () => {
    const slim = applySilhouettePreset(DEFAULT_STUDIO_STATE, "slim")
    expect(slim.silhouette).toBe("slim")
    expect(slim.bodyWidth).toBeLessThan(DEFAULT_STUDIO_STATE.bodyWidth)
    expect(slim.height).toBeGreaterThan(DEFAULT_STUDIO_STATE.height)
  })

  test("merge and reset", () => {
    const merged = mergeStudioState(DEFAULT_STUDIO_STATE, { fillAmount: 0.9 })
    expect(merged.fillAmount).toBe(0.9)
    expect(resetStudioState()).toEqual(DEFAULT_STUDIO_STATE)
  })
})
