import type { FramePreset } from '@lauriparonen/alembic-ornaments'

export function exportFileBaseName(framePreset: FramePreset, frameSeed: number): string {
  return `alembic-${framePreset}-seed-${frameSeed}`
}

export function exportSvgFileName(framePreset: FramePreset, frameSeed: number): string {
  return `${exportFileBaseName(framePreset, frameSeed)}.svg`
}

export function exportPngFileName(framePreset: FramePreset, frameSeed: number): string {
  return `${exportFileBaseName(framePreset, frameSeed)}.png`
}

export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.rel = 'noopener'
  document.body.append(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
