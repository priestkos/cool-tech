import { describe, expect, test } from "bun:test"
import { createCropper } from "@zriz/core"
import { clampExportSize } from "./exportUtils"
import {
  ASPECT_PRESETS,
  presetById,
  zrizAspectValue,
} from "./aspectPresets"
import {
  formatAspect,
  formatGeometryReadout,
  formatReadoutLines,
} from "./geometryReadout"
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

describe("upload rejection edges", () => {
  test("rejects an empty png with the empty-file reason", () => {
    const result = validateUploadFile(
      new File([], "empty.png", { type: "image/png" }),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("That file is empty.")
  })

  test("accepts a one-byte file of each supported type", () => {
    const types = ["image/jpeg", "image/webp", "image/gif", "image/svg+xml"]
    for (const type of types) {
      const result = validateUploadFile(
        new File([new Uint8Array([1])], "photo", { type }),
      )
      expect(result.ok).toBe(true)
    }
  })

  test("accepts a png at the 40 MB limit and rejects one byte over", () => {
    const limit = 40 * 1024 * 1024
    const atLimit = validateUploadFile(
      new File([new Uint8Array(limit)], "max.png", { type: "image/png" }),
    )
    expect(atLimit.ok).toBe(true)

    const over = validateUploadFile(
      new File([new Uint8Array(limit + 1)], "over.png", { type: "image/png" }),
    )
    expect(over.ok).toBe(false)
    if (!over.ok) expect(over.reason).toBe("Keep uploads under 40 MB for this demo.")
  })

  test("rejects two png files", () => {
    const files = [
      new File([PNG_1X1], "a.png", { type: "image/png" }),
      new File([PNG_1X1], "b.png", { type: "image/png" }),
    ]
    const result = validateUploadFiles(files)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe("Upload one photo at a time.")
  })
})

describe("formatAspect", () => {
  test("names free, original, and common ratios", () => {
    expect(formatAspect("free")).toBe("free")
    expect(formatAspect("original")).toBe("original")
    expect(formatAspect(1)).toBe("1:1")
    expect(formatAspect(4 / 5)).toBe("4:5")
    expect(formatAspect(5 / 4)).toBe("5:4")
    expect(formatAspect(16 / 9)).toBe("16:9")
    expect(formatAspect(9 / 16)).toBe("9:16")
  })

  test("uses a strict less-than tolerance around 1:1", () => {
    expect(formatAspect(1.019)).toBe("1:1")
    expect(formatAspect(1.02)).toBe("1.020")
  })
})

describe("geometry sign and flip", () => {
  test("prints a negative rotation without a plus and a horizontal flip", () => {
    const cropper = createCropper({ defaultValue: { rotation: -8.2 } })
    cropper.setImage({ width: 1000, height: 800 })
    cropper.flip("x")
    const readout = formatGeometryReadout(
      cropper.getValue(),
      cropper.getState(),
      1,
    )
    expect(readout.rotation).toBe("-8.2°")
    expect(readout.flips).toBe("horizontal")
  })
})

describe("export clamp edges", () => {
  test("leaves size alone without a max or when a side is non-positive", () => {
    expect(clampExportSize(20, 10)).toEqual({ width: 20, height: 10 })
    expect(clampExportSize(0, 10, { width: 8, height: 8 })).toEqual({
      width: 0,
      height: 10,
    })
  })

  test("limits by height and floors each side at 1px", () => {
    expect(clampExportSize(50, 100, { width: 80, height: 40 })).toEqual({
      width: 20,
      height: 40,
    })
    expect(clampExportSize(3, 1000, { width: 100, height: 2 })).toEqual({
      width: 1,
      height: 2,
    })
  })
})