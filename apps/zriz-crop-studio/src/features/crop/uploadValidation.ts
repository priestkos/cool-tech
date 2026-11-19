const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
])

const MAX_BYTES = 40 * 1024 * 1024

export type UploadValidationResult =
  | { ok: true; file: File }
  | { ok: false; reason: string }

export const validateUploadFile = (file: File): UploadValidationResult => {
  if (!ACCEPTED_TYPES.has(file.type)) {
    return {
      ok: false,
      reason: "Use JPEG, PNG, WebP, GIF, or SVG.",
    }
  }
  if (file.size <= 0) {
    return { ok: false, reason: "That file is empty." }
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      reason: "Keep uploads under 40 MB for this demo.",
    }
  }
  return { ok: true, file }
}

export const validateUploadFiles = (
  files: FileList | File[],
): UploadValidationResult => {
  const list = Array.from(files)
  if (list.length === 0) {
    return { ok: false, reason: "No file was selected." }
  }
  if (list.length > 1) {
    return { ok: false, reason: "Upload one photo at a time." }
  }
  return validateUploadFile(list[0]!)
}