export type BriefOutline = {
  title: string
  subtitle: string
  bullets: string[]
  stats: Array<{ label: string; value: string; numeric: number }>
  chartBars: Array<{ label: string; value: number }>
  closing: string
  seed: string
}

const bulletRe = /^[-*•]\s+/

function normalizeLine(line: string): string {
  return line.replace(bulletRe, '').trim()
}

function fnv1a(text: string): string {
  let hash = 2166136261
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function extractStats(lines: string[]): BriefOutline['stats'] {
  const stats: BriefOutline['stats'] = []
  for (const line of lines) {
    const matches = [...line.matchAll(/(\d+(?:\.\d+)?)\s*(%|ms|min|s|MB|GB)?/gi)]
    for (const m of matches) {
      const numeric = Number.parseFloat(m[1] ?? '0')
      if (Number.isNaN(numeric)) continue
      const unit = m[2] ?? ''
      const label =
        line.replace(m[0], '').replace(bulletRe, '').trim().slice(0, 80) || 'Metric'
      stats.push({
        label,
        value: `${m[1]}${unit}`,
        numeric,
      })
    }
  }
  return stats.slice(0, 6)
}

/** Deterministic brief → outline parser (mock mode, no AI). */
export function parseBrief(text: string): BriefOutline {
  const trimmed = text.trim()
  if (!trimmed) {
    throw new Error('Brief is empty — add a title and a few bullet points.')
  }
  if (trimmed.length > 2000) {
    throw new Error('Brief exceeds 2,000 characters.')
  }

  const rawLines = trimmed.split(/\r?\n/)
  const nonEmpty = rawLines.map((l) => l.trim()).filter(Boolean)
  const title = nonEmpty[0] ?? 'Untitled brief'
  const second = nonEmpty[1]
  const subtitle = second && !bulletRe.test(second) ? second : ''

  const bulletLines = nonEmpty.filter((l) => bulletRe.test(l)).map(normalizeLine)
  const proseLines = nonEmpty.slice(1).filter((l) => !bulletRe.test(l) && l !== subtitle)

  const bullets =
    bulletLines.length > 0
      ? bulletLines
      : proseLines.slice(0, 4).length > 0
        ? proseLines.slice(0, 4)
        : ['Key point one', 'Key point two', 'Key point three']

  const stats = extractStats(nonEmpty)
  const chartBars = stats.slice(0, 4).map((s, i) => ({
    label: s.label.slice(0, 24) || `Series ${i + 1}`,
    value: Math.max(1, Math.round(s.numeric)),
  }))
  if (chartBars.length < 4) {
    const fallback = [42, 58, 71, 64]
    while (chartBars.length < 4) {
      const i = chartBars.length
      chartBars.push({ label: `Item ${i + 1}`, value: fallback[i] ?? 50 })
    }
  }

  const closing =
    proseLines.find((l) => /goal|recommend|target|next/i.test(l)) ??
    proseLines[proseLines.length - 1] ??
    'Thank you — questions welcome.'

  return {
    title,
    subtitle,
    bullets,
    stats,
    chartBars,
    closing,
    seed: fnv1a(trimmed),
  }
}

export type Slide =
  | { kind: 'title'; title: string; subtitle: string }
  | { kind: 'bullets'; heading: string; items: string[] }
  | { kind: 'stat'; label: string; value: string }
  | { kind: 'chart'; heading: string; bars: Array<{ label: string; value: number }> }
  | { kind: 'closing'; line: string }

/** Build an ordered slide list from outline and desired count (3–8). */
export function buildSlidePlan(outline: BriefOutline, slideCount: number): Slide[] {
  const count = Math.min(8, Math.max(3, slideCount))
  const slides: Slide[] = [
    {
      kind: 'title',
      title: outline.title,
      subtitle: outline.subtitle || 'Mock deck from your brief',
    },
  ]

  const room = count - 2
  const chunkSize = Math.max(2, Math.ceil(outline.bullets.length / Math.max(1, room)))
  let bi = 0
  while (bi < outline.bullets.length && slides.length < count - 1) {
    slides.push({
      kind: 'bullets',
      heading: bi === 0 ? 'Highlights' : 'More detail',
      items: outline.bullets.slice(bi, bi + chunkSize),
    })
    bi += chunkSize
  }

  if (slides.length < count - 1 && outline.stats[0]) {
    slides.push({
      kind: 'stat',
      label: outline.stats[0].label,
      value: outline.stats[0].value,
    })
  }
  if (slides.length < count - 1) {
    slides.push({
      kind: 'chart',
      heading: 'By the numbers',
      bars: outline.chartBars,
    })
  }

  while (slides.length < count - 1) {
    slides.push({
      kind: 'bullets',
      heading: 'Notes',
      items: outline.bullets.slice(0, 2),
    })
  }

  slides.push({ kind: 'closing', line: outline.closing })
  return slides.slice(0, count)
}
