import { composeExportSvg } from './export-svg'
import type { StudioState } from './studio-state'
import { exportPngFileName, triggerDownload } from './download'

export async function exportPngFromState(
  state: StudioState,
  options: { transparentBackground: boolean; pageBackground?: string },
): Promise<void> {
  const width = state.cardWidth
  const height = state.cardHeight
  const scale = 2
  const svg = composeExportSvg({
    state,
    width,
    height,
    includeBackground: !options.transparentBackground,
    pageBackground: options.pageBackground ?? '#ffffff',
  })

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  try {
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unsupported')
    ctx.scale(scale, scale)
    if (!options.transparentBackground) {
      ctx.fillStyle = options.pageBackground ?? '#ffffff'
      ctx.fillRect(0, 0, width, height)
    }
    ctx.drawImage(img, 0, 0, width, height)
    const pngBlob = await canvasToBlob(canvas)
    triggerDownload(pngBlob, exportPngFileName(state.framePreset, state.frameSeed))
  } finally {
    URL.revokeObjectURL(url)
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to rasterise SVG'))
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('PNG encode failed'))
    }, 'image/png')
  })
}
