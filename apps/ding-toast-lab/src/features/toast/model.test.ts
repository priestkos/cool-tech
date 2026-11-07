import { describe, expect, test } from "bun:test"
import {
  archiveItem,
  clampProgress,
  dismissToast,
  morphToast,
  restoreItem,
  shouldApplyAsyncResult,
  INITIAL_ITEMS,
  HIDDEN_TOAST,
} from "./model"

describe("clampProgress", () => {
  test("clamps to 0–100", () => {
    expect(clampProgress(-4)).toBe(0)
    expect(clampProgress(120)).toBe(100)
    expect(clampProgress(42)).toBe(42)
  })
})

describe("shouldApplyAsyncResult", () => {
  test("accepts only matching loading generation", () => {
    expect(shouldApplyAsyncResult(2, 2, "loading")).toBe(true)
    expect(shouldApplyAsyncResult(2, 3, "loading")).toBe(false)
    expect(shouldApplyAsyncResult(2, 2, "success")).toBe(false)
  })
})

describe("morphToast", () => {
  test("morphs in place without stacking generations by default", () => {
    const base = morphToast(HIDDEN_TOAST, {
      status: "loading",
      title: "Working",
    })
    expect(base.generation).toBe(0)
    const morphed = morphToast(base, { status: "success", title: "Done" })
    expect(morphed.generation).toBe(0)
    expect(morphed.status).toBe("success")
  })

  test("increments generation when requested", () => {
    const next = morphToast(
      HIDDEN_TOAST,
      { status: "success", title: "Hi" },
      { incrementGeneration: true },
    )
    expect(next.generation).toBe(1)
  })
})

describe("dismissToast", () => {
  test("resets visible fields and bumps generation", () => {
    const visible = morphToast(HIDDEN_TOAST, { status: "error", title: "Oops" })
    const hidden = dismissToast(visible)
    expect(hidden.status).toBe("hidden")
    expect(hidden.generation).toBe(visible.generation + 1)
  })
})

describe("archive helpers", () => {
  test("archive and restore sample item", () => {
    const archived = archiveItem(INITIAL_ITEMS, "b")
    expect(archived.find((i) => i.id === "b")?.archived).toBe(true)
    const restored = restoreItem(archived, "b")
    expect(restored.find((i) => i.id === "b")?.archived).toBe(false)
  })
})
