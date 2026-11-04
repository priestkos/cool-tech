import { paletteForTheme, USER_TILE } from "./diagram-theme"
import type { DiagramEdge, DiagramTheme, DiagramTile, LayoutResult, PositionMap } from "./types"
import { TILE_HEIGHT, TILE_WIDTH } from "./types"

export interface ComposeInput {
  tiles: DiagramTile[]
  edges: DiagramEdge[]
  positions: PositionMap
  layout: LayoutResult
  diagramTheme: DiagramTheme
  includeUser?: boolean
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function edgePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const x1 = from.x + TILE_WIDTH
  const y1 = from.y + TILE_HEIGHT / 2
  const x2 = to.x
  const y2 = to.y + TILE_HEIGHT / 2
  const mid = (x1 + x2) / 2
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`
}

function renderTileSvg(tile: DiagramTile, pos: { x: number; y: number }, palette: ReturnType<typeof paletteForTheme>): string {
  const label = escapeXml(tile.label)
  const mono = escapeXml(tile.monogram.slice(0, 3))
  const unknown = tile.isUnknown ? ' data-unknown="true"' : ""
  return `<g transform="translate(${pos.x},${pos.y})"${unknown} data-id="${escapeXml(tile.instanceId)}">
  <rect width="${TILE_WIDTH}" height="${TILE_HEIGHT}" rx="10" fill="${palette.tileBg}" stroke="${palette.border}" stroke-width="1.5"/>
  <rect x="12" y="14" width="32" height="32" rx="8" fill="${palette.badgeBg}"/>
  <text x="28" y="35" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" font-weight="600" fill="${palette.badgeText}">${mono}</text>
  <text x="54" y="35" font-family="system-ui,sans-serif" font-size="13" font-weight="600" fill="${palette.text}">${label}</text>
  <text x="54" y="52" font-family="system-ui,sans-serif" font-size="10" fill="${palette.muted}">${escapeXml(tile.category)}</text>
</g>`
}

/** Deterministic SVG document string (no external URLs). */
export function composeDiagramSvg(input: ComposeInput): string {
  const palette = paletteForTheme(input.diagramTheme)
  const allTiles = input.includeUser !== false ? [USER_TILE, ...input.tiles] : input.tiles
  const positions = { ...input.positions }
  if (input.includeUser !== false && !positions[USER_TILE.instanceId]) {
    positions[USER_TILE.instanceId] = { x: 48, y: 48 }
  }

  const edgeLines = input.edges
    .map((edge) => {
      const from = positions[edge.from]
      const to = positions[edge.to]
      if (!from || !to) return ""
      const d = edgePath(from, to)
      return `<path d="${d}" fill="none" stroke="${palette.arrow}" stroke-width="1.5" marker-end="url(#arrow)"/>`
    })
    .filter(Boolean)
    .join("\n")

  const tileLines = allTiles
    .map((tile) => {
      const pos = positions[tile.instanceId]
      if (!pos) return ""
      return renderTileSvg(tile, pos, palette)
    })
    .filter(Boolean)
    .join("\n")

  const w = input.layout.width
  const h = input.layout.height

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Stack diagram">
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="${palette.arrow}"/>
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="${palette.bg}"/>
  ${edgeLines}
  ${tileLines}
</svg>`
}

export function composeStandaloneHtml(input: ComposeInput, title: string): string {
  const svg = composeDiagramSvg(input)
  const palette = paletteForTheme(input.diagramTheme)
  const safeTitle = escapeXml(title)
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${safeTitle}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, "Segoe UI", Roboto, sans-serif; background: ${palette.bg}; color: ${palette.text}; }
  main { max-width: 960px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 1.125rem; font-weight: 600; margin: 0 0 16px; }
  .diagram { overflow: auto; border: 1px solid ${palette.border}; border-radius: 12px; }
  svg { display: block; max-width: 100%; height: auto; }
  footer { margin-top: 16px; font-size: 12px; color: ${palette.muted}; }
</style>
</head>
<body>
<main>
  <h1>${safeTitle}</h1>
  <div class="diagram">${svg.replace(/^<\?xml[^>]*>\s*/, "")}</div>
  <footer>Unofficial community demo. Idea inspired by caru-ini/stack-diagram (MIT).</footer>
</main>
</body>
</html>`
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportPngFromSvg(
  svgString: string,
  filename: string,
  scale = 2,
  transparent = false,
): Promise<void> {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error("SVG load failed"))
    img.src = url
  })
  const canvas = document.createElement("canvas")
  canvas.width = img.width * scale
  canvas.height = img.height * scale
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unsupported")
  if (!transparent) {
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  ctx.scale(scale, scale)
  ctx.drawImage(img, 0, 0)
  URL.revokeObjectURL(url)
  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((png) => {
      if (!png) {
        reject(new Error("PNG encode failed"))
        return
      }
      const pngUrl = URL.createObjectURL(png)
      const a = document.createElement("a")
      a.href = pngUrl
      a.download = filename
      a.click()
      URL.revokeObjectURL(pngUrl)
      resolve()
    }, "image/png")
  })
}
