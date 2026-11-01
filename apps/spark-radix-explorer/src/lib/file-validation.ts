export const MAX_SPLAT_FILE_BYTES = 200 * 1024 * 1024

const SUPPORTED_EXTENSIONS = new Set([".ply", ".spz"])

export type FileValidationResult =
  | { ok: true; name: string; extension: ".ply" | ".spz" }
  | { ok: false; message: string }

function extensionOf(name: string): string {
  const lower = name.toLowerCase()
  const dot = lower.lastIndexOf(".")
  if (dot === -1) return ""
  return lower.slice(dot)
}

export function validateSplatFile(
  file: Pick<File, "name" | "size"> | null | undefined,
): FileValidationResult {
  if (!file) {
    return { ok: false, message: "No file was provided." }
  }
  if (file.size === 0) {
    return { ok: false, message: `"${file.name}" is empty.` }
  }
  if (file.size > MAX_SPLAT_FILE_BYTES) {
    return {
      ok: false,
      message: `"${file.name}" is ${formatBytes(file.size)}. The limit is 200 MB.`,
    }
  }
  const ext = extensionOf(file.name)
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return {
      ok: false,
      message: `"${file.name}" is not supported. Drop a .ply or .spz file.`,
    }
  }
  return { ok: true, name: file.name, extension: ext as ".ply" | ".spz" }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
