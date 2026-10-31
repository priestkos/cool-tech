import type { BrandKit } from './brands'
import { buildDeckHtml } from './build-deck'
import type { DeckFormat } from './formats'
import { fontFacesForKit } from './font-data'
import type { Slide } from './parse-brief'

export function downloadDeckHtml(
  kit: BrandKit,
  format: DeckFormat,
  slides: Slide[],
  customAccent?: string | null,
): void {
  const html = buildDeckHtml({
    kit,
    format,
    slides,
    fontFaces: fontFacesForKit(kit),
    customAccent,
    showMockBadge: true,
    exportMode: true,
  })
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const slug = kit.slug
  const first = slides[0]
  const briefSlug = first?.kind === 'title' ? slugify(first.title) : 'deck'
  const name = `${slug}-${briefSlug}.html`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'deck'
}
