import { describe, expect, test } from "bun:test"
import {
  parseSliceOptions,
  resolveGalleryAsset,
  safeSheetBasename,
  sliceTitle,
  uploadDecision,
} from "../server/slice-request"

const GALLERY = "/var/studio/public/gallery"

describe("parseSliceOptions", () => {
  test("empty slices and missing colours", () => {
    const form = new FormData()
    form.set("slices", "")
    const options = parseSliceOptions(form)
    expect(options.slices).toBeUndefined()
    expect(options.colours).toBeUndefined()
    expect(options.round).toBe(false)
  })

  test("reads numeric and boolean fields, including shade 0", () => {
    const form = new FormData()
    form.set("slices", "4")
    form.set("round", "true")
    form.set("colours", "8")
    form.set("order", "reading")
    form.set("sideNose", "left")
    form.set("shade", "0")
    form.set("preview", "true")
    form.set("normals", "true")
    form.set("emissive", "true")
    expect(parseSliceOptions(form)).toEqual({
      slices: 4,
      round: true,
      colours: 8,
      order: "reading",
      sideNose: "left",
      shade: 0,
      preview: true,
      normals: true,
      emissive: true,
    })
  })

  test("non-numeric slices become undefined", () => {
    const form = new FormData()
    form.set("slices", "nope")
    expect(parseSliceOptions(form).slices).toBeUndefined()
  })

  test("empty order becomes undefined", () => {
    const form = new FormData()
    form.set("order", "")
    expect(parseSliceOptions(form).order).toBeUndefined()
  })

  test("order is passed through with no allowlist", () => {
    const form = new FormData()
    form.set("order", "sideways")
    expect(parseSliceOptions(form).order).toBe("sideways")
  })
})

describe("uploadDecision", () => {
  test("missing file", () => {
    expect(uploadDecision(null)).toEqual({ ok: false, status: 400, error: "Missing file field" })
  })

  test("rejects a non-image without a png or webp name", () => {
    expect(uploadDecision({ type: "text/plain", name: "note.txt", size: 12 })).toEqual({
      ok: false,
      status: 415,
      error: "Only PNG or WebP images are accepted",
    })
  })

  test("accepts a non-image type when the name extension matches", () => {
    expect(uploadDecision({ type: "text/plain", name: "sheet.PNG", size: 12 })).toEqual({ ok: true })
  })

  test("accepts an image at the size limit", () => {
    expect(uploadDecision({ type: "image/png", name: "sheet.png", size: 8 * 1024 * 1024 })).toEqual({ ok: true })
  })

  test("rejects an image one byte over the size limit", () => {
    expect(uploadDecision({ type: "image/webp", name: "sheet.webp", size: 8 * 1024 * 1024 + 1 })).toEqual({
      ok: false,
      status: 413,
      error: "File too large",
    })
  })
})

describe("safeSheetBasename", () => {
  test("replaces spaces", () => {
    expect(safeSheetBasename("my sheet.png")).toBe("my_sheet.png")
  })

  test("replaces slashes", () => {
    expect(safeSheetBasename("a/../../etc")).toBe("a_.._.._etc")
  })

  test("empty name falls back to upload", () => {
    expect(safeSheetBasename("")).toBe("upload")
  })

  test("truncates to 80 characters", () => {
    expect(safeSheetBasename("a".repeat(81))).toBe("a".repeat(80))
  })

  test("punctuation becomes underscores, not the upload fallback", () => {
    expect(safeSheetBasename("!!!")).toBe("___")
  })
})

describe("sliceTitle", () => {
  test("strips the last extension", () => {
    expect(sliceTitle("sheet.png")).toBe("sheet")
    expect(sliceTitle("a.b.png")).toBe("a.b")
    expect(sliceTitle("noext")).toBe("noext")
  })
})

describe("resolveGalleryAsset", () => {
  test("joins a plain filename under the gallery", () => {
    expect(resolveGalleryAsset(GALLERY, "hero.png")).toBe("/var/studio/public/gallery/hero.png")
  })

  test("rejects a parent traversal", () => {
    expect(resolveGalleryAsset(GALLERY, "../secrets.txt")).toBeNull()
  })

  test("rejects a nested traversal", () => {
    expect(resolveGalleryAsset(GALLERY, "a/../../outside.txt")).toBeNull()
  })

  test("prefix sibling still passes", () => {
    expect(resolveGalleryAsset(GALLERY, "../gallery-evil/x")).toBe("/var/studio/public/gallery-evil/x")
  })

  test("leading slash is joined under the gallery", () => {
    expect(resolveGalleryAsset(GALLERY, "/etc/passwd")).toBe("/var/studio/public/gallery/etc/passwd")
  })
})
