import { fitFrame, generateOrnament } from '@lauriparonen/alembic-ornaments'
import type { StudioState } from './studio-state'

export interface ComposeExportInput {
  state: StudioState
  width: number
  height: number
  /** When false, omit the background rect (PNG transparent mode). */
  includeBackground: boolean
  /** Page background behind the card (for non-transparent PNG). */
  pageBackground?: string
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function parseSvgRoot(svg: string): { viewBox: string; inner: string } {
  const viewMatch = /viewBox="([^"]+)"/.exec(svg)
  const viewBox = viewMatch?.[1] ?? '0 0 100 100'
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  return { viewBox, inner }
}

function resolveCurrentColor(markup: string, color: string): string {
  return markup.replace(/currentColor/g, color)
}

function wrapOrnamentSvg(
  ornamentSvg: string,
  x: number,
  y: number,
  displayWidth: number,
  displayHeight: number,
  color: string,
): string {
  const { viewBox, inner } = parseSvgRoot(ornamentSvg)
  const resolved = resolveCurrentColor(inner, color)
  return `<svg x="${x}" y="${y}" width="${displayWidth}" height="${displayHeight}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" color="${color}">${resolved}</svg>`
}

function textBlock(state: StudioState, width: number, height: number, inset: number): string {
  const innerW = width - inset * 2
  const innerH = height - inset * 2
  const cx = inset + innerW / 2
  const titleSize = state.layout === 'card' ? 22 : 18
  const bodySize = state.layout === 'card' ? 14 : 16
  const lines: string[] = []

  if (state.layout === 'card') {
    lines.push(
      `<text x="${cx}" y="${inset + innerH * 0.28}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${titleSize}" fill="${state.inkColor}">${escapeXml(state.title)}</text>`,
    )
    const bodyY = inset + innerH * 0.42
    lines.push(
      `<text x="${cx}" y="${bodyY}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${bodySize}" fill="${state.inkColor}">${escapeXml(state.body)}</text>`,
    )
  } else {
    lines.push(
      `<text x="${cx}" y="${inset + innerH * 0.35}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${bodySize}" font-style="italic" fill="${state.inkColor}">“${escapeXml(state.body)}”</text>`,
    )
    if (state.title.trim()) {
      lines.push(
        `<text x="${cx}" y="${inset + innerH * 0.62}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="13" fill="${state.inkColor}">— ${escapeXml(state.title)}</text>`,
      )
    }
  }

  return lines.join('\n')
}

/** Standalone SVG at the given pixel size; deterministic for the same input. */
export function composeExportSvg(input: ComposeExportInput): string {
  const { state, width, height, includeBackground, pageBackground = '#ffffff' } = input
  const fitted = fitFrame(
    {
      preset: state.framePreset,
      seed: state.frameSeed,
      size: state.frameSize,
      clear: state.frameClear,
    },
    width,
    height,
  )

  if (!fitted) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" color="${state.inkColor}"></svg>`
  }

  const frameParts = parseSvgRoot(fitted.svg)
  const frameInner = resolveCurrentColor(frameParts.inner, state.inkColor)
  const frameMarkup = `<svg x="0" y="0" width="${width}" height="${height}" viewBox="${frameParts.viewBox}" xmlns="http://www.w3.org/2000/svg" color="${state.inkColor}">${frameInner}</svg>`

  let dividerMarkup = ''
  if (state.dividerEnabled) {
    const ornament = generateOrnament({ preset: state.dividerPreset, seed: state.dividerSeed })
    const maxW = width - fitted.inset * 2 - 16
    const displayW = Math.min(maxW, ornament.width)
    const displayH = (displayW / ornament.width) * ornament.height
    const x = (width - displayW) / 2
    const y = state.layout === 'card' ? fitted.inset + 12 : fitted.inset + 8
    dividerMarkup = wrapOrnamentSvg(ornament.svg, x, y, displayW, displayH, state.inkColor)
  }

  const textMarkup = textBlock(state, width, height, fitted.inset)
  const bg =
    includeBackground
      ? `<rect width="${width}" height="${height}" fill="${pageBackground}"/>`
      : ''

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" color="${state.inkColor}">`,
    bg,
    frameMarkup,
    dividerMarkup,
    textMarkup,
    '</svg>',
  ].join('\n')
}

/** True when the string is well-formed XML-ish and has no unresolved currentColor. */
export function validateExportSvg(svg: string): { ok: boolean; reason?: string } {
  if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) {
    return { ok: false, reason: 'missing root svg' }
  }
  if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
    return { ok: false, reason: 'missing xmlns' }
  }
  if (svg.includes('currentColor')) {
    return { ok: false, reason: 'unresolved currentColor' }
  }
  return { ok: true }
}
