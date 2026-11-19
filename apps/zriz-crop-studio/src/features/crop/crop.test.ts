import { describe, expect, test } from "bun:test"
import { createCropper } from "@zriz/core"
import { clampExportSize } from "./exportUtils"
import {
  ASPECT_PRESETS,
  presetById,
  zrizAspectValue,
} from "./aspectPresets"
import { formatGeometryReadout, formatReadoutLines } from "./geometryReadout"
import { validateUploadFile, validateUploadFiles } from "./uploadValidation"

/** Valid 1×1 PNG (decodable in Bun and browsers). */
const PNG_1X1 = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  ),
  (c) => c.charCodeAt(0),
)

describe("aspect presets", () => {
  test("maps circle avatar to square aspect with circle shape", () => {
    const circle = presetById("circle")
    expect(circle.aspect).toBe(1)
    expect(circle.shape).toBe("circle")
  })

  test("applies 16:9 landscape swap when orientation toggled", () => {
    const preset = presetById("16:9")
    expect(zrizAspectValue(preset, false)).toBeCloseTo(16 / 9)
    expect(zrizAspectValue(preset, true)).toBeCloseTo(9 / 16)
  })

  test("preset list covers required modes", () => {
    const ids = ASPECT_PRESETS.map((p) => p.id)
    expect(ids).toEqual([
      "free",
      "original",
      "square",
      "4:5",
      "16:9",
      "circle",
    ])
  })
})

describe("rotate and flip state", () => {
  test("rotate90 and flip update cropper value", () => {
    const cropper = createCropper()
    cropper.setImage({ width: 800, height: 600 })
    const turnsBefore = cropper.getValue().quarterTurns
    cropper.rotate90("cw")
    expect(cropper.getValue().quarterTurns).not.toBe(turnsBefore)
    expect(cropper.getValue().mirrored).toBe(false)
    cropper.flip("x")
    expect(cropper.getValue().mirrored).toBe(true)
    cropper.setAspect(1)
    expect(cropper.getState().aspect).toBe(1)
  })
})

describe("geometry readout formatting", () => {
  test("formats stable lines for inspector", () => {
    const cropper = createCropper({ defaultValue: { rotation: 12.5 } })
    cropper.setImage({ width: 1000, height: 800 })
    const value = cropper.getValue()
    const readout = formatGeometryReadout(value, cropper.getState(), 1.25)
    const lines = formatReadoutLines(readout)
    expect(lines[0]).toMatch(/center/)
    expect(lines[1]).toContain("rotation +12.5°")
    expect(lines[2]).toBe("zoom 1.25×")
  })
})

describe("upload validation", () => {
  test("rejects empty and unsupported uploads", async () => {
    const bad = new File([], "empty.txt", { type: "text/plain" })
    expect(validateUploadFile(bad).ok).toBe(false)
    const ok = new File([PNG_1X1], "shot.png", { type: "image/png" })
    expect(validateUploadFile(ok).ok).toBe(true)
    expect(validateUploadFiles([]).ok).toBe(false)
  })
})

describe("export", () => {
  test("clampExportSize matches zriz maxSize intent", () => {
    expect(clampExportSize(100, 50, { width: 8, height: 8 })).toEqual({
      width: 8,
      height: 4,
    })
    expect(clampExportSize(10, 10, { width: 64, height: 64 })).toEqual({
      width: 10,
      height: 10,
    })
  })

  test("getPixelCrop yields non-zero export plan for loaded geometry", () => {
    const cropper = createCropper()
    cropper.setImage({ width: 640, height: 480 })
    cropper.setAspect(16 / 9)
    const plan = cropper.getPixelCrop(1)
    expect(plan).not.toBeNull()
    if (plan) {
      expect(plan.width).toBeGreaterThan(0)
      expect(plan.height).toBeGreaterThan(0)
      const sized = clampExportSize(plan.width, plan.height, {
        width: 320,
        height: 180,
      })
      expect(sized.width).toBeLessThanOrEqual(320)
      expect(sized.height).toBeLessThanOrEqual(180)
    }
  })
})