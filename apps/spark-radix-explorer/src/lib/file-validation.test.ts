import { describe, expect, test } from "bun:test"
import { MAX_SPLAT_FILE_BYTES, validateSplatFile } from "./file-validation"

describe("validateSplatFile", () => {
  test("accepts supported extensions under the size limit", () => {
    expect(validateSplatFile({ name: "scene.spz", size: 1024 })).toEqual({
      ok: true,
      name: "scene.spz",
      extension: ".spz",
    })
    expect(validateSplatFile({ name: "capture.PLY", size: 42 })).toEqual({
      ok: true,
      name: "capture.PLY",
      extension: ".ply",
    })
  })

  test("rejects empty, oversized, and unsupported files", () => {
    expect(validateSplatFile({ name: "empty.spz", size: 0 }).ok).toBe(false)
    expect(validateSplatFile({ name: "big.spz", size: MAX_SPLAT_FILE_BYTES + 1 }).ok).toBe(
      false,
    )
    expect(validateSplatFile({ name: "model.glb", size: 100 }).ok).toBe(false)
    expect(validateSplatFile(null).ok).toBe(false)
  })
})
