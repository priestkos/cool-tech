import path from "node:path"
import { MAX_UPLOAD_BYTES, type SlicerOptions } from "../src/constants"

const IMAGE_TYPES = new Set(["image/png", "image/webp"])

export function parseSliceOptions(form: FormData): SlicerOptions {
  const slicesRaw = form.get("slices")
  const coloursRaw = form.get("colours")
  let slices: number | null | undefined
  if (slicesRaw === null || slicesRaw === "") {
    slices = undefined
  } else {
    const n = Number(slicesRaw)
    slices = Number.isFinite(n) ? n : undefined
  }
  const colours = coloursRaw === null || coloursRaw === "" ? undefined : Number(coloursRaw)
  return {
    slices,
    round: form.get("round") === "true",
    colours: Number.isFinite(colours) ? colours : undefined,
    order: (form.get("order") as "auto" | "reading") || undefined,
    sideNose: (form.get("sideNose") as "left" | "right") || undefined,
    shade: form.get("shade") ? Number(form.get("shade")) : undefined,
    preview: form.get("preview") === "true",
    normals: form.get("normals") === "true",
    emissive: form.get("emissive") === "true",
  }
}

export function uploadDecision(
  file: { type: string; name: string; size: number } | null,
): { ok: true } | { ok: false; status: number; error: string } {
  if (file === null) return { ok: false, status: 400, error: "Missing file field" }
  if (!IMAGE_TYPES.has(file.type) && !file.name.match(/\.(png|webp)$/i)) {
    return { ok: false, status: 415, error: "Only PNG or WebP images are accepted" }
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, status: 413, error: "File too large" }
  }
  return { ok: true }
}

export function safeSheetBasename(basename: string): string {
  return basename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "upload"
}

export function sliceTitle(filename: string): string {
  return filename.replace(/\.[^.]+$/, "")
}

export function resolveGalleryAsset(galleryDir: string, rel: string): string | null {
  const filePath = path.join(galleryDir, rel)
  if (!filePath.startsWith(galleryDir)) return null
  return filePath
}
