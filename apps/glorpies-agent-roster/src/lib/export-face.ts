import { faceCanvas, faceSVG, type StillOptions } from "glorpies"

export function sanitizeExportBase(name: string | number): string {
  const base = String(name)
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return base.slice(0, 80) || "glorpie"
}

export function buildExportFileName(name: string | number, ext: "svg" | "png"): string {
  return `glorpie-${sanitizeExportBase(name)}.${ext}`
}

const EXTERNAL_URL =
  /(?:xlink:href\s*=\s*["']https?:|\bhref\s*=\s*["']https?:|\bsrc\s*=\s*["']https?:|url\s*\(\s*["']?https?:)/i

export function assertSvgWellFormed(svg: string): boolean {
  if (!svg.includes("<svg")) return false
  if (EXTERNAL_URL.test(svg)) return false
  return true
}

export function createSvgBlob(svg: string): Blob {
  return new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
}

export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png")
  })
}

export function exportSvgString(name: string | number, options: StillOptions): string {
  return faceSVG(name, options)
}

export function exportPngCanvas(name: string | number, options: StillOptions): HTMLCanvasElement {
  return faceCanvas(name, options)
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.rel = "noopener"
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
