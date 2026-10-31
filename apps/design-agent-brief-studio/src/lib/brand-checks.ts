import type { BrandKit } from './brands'
import type { BriefOutline } from './parse-brief'

export type CheckSeverity = 'pass' | 'warn' | 'fail'

export type BrandCheck = {
  id: string
  label: string
  severity: CheckSeverity
  detail: string
}

function normalizeHex(hex: string): string {
  const h = hex.trim().toLowerCase()
  if (/^#[0-9a-f]{3}$/.test(h)) {
    return `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
  }
  return h
}

function relativeLuminance(hex: string): number {
  const n = normalizeHex(hex).replace('#', '')
  const r = Number.parseInt(n.slice(0, 2), 16) / 255
  const g = Number.parseInt(n.slice(2, 4), 16) / 255
  const b = Number.parseInt(n.slice(4, 6), 16) / 255
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const R = lin(r)
  const G = lin(g)
  const B = lin(b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

function isOnPalette(color: string, kit: BrandKit): boolean {
  const c = normalizeHex(color)
  const allowed = [...kit.allowedColors, ...kit.extendedPalette].map(normalizeHex)
  return allowed.includes(c)
}

export function runBrandChecks(input: {
  kit: BrandKit
  outline: BriefOutline
  customAccent?: string | null
  deckRadiusPx?: number
}): BrandCheck[] {
  const { kit, outline, customAccent, deckRadiusPx = 8 } = input
  const checks: BrandCheck[] = []

  const paletteOk = isOnPalette(kit.tokens['--brand-color-signal'] ?? '#000', kit)
  checks.push({
    id: 'palette-signal',
    label: 'Signal color on palette',
    severity: paletteOk ? 'pass' : 'fail',
    detail: paletteOk ? 'Accent uses an allowed token.' : 'Signal color is off-palette.',
  })

  if (customAccent) {
    const accent = normalizeHex(customAccent)
    const banned = kit.bannedColors.map(normalizeHex).includes(accent)
    const onPalette = isOnPalette(accent, kit)
    let severity: CheckSeverity = 'pass'
    let detail = 'Custom accent is allowed.'
    if (banned) {
      severity = 'fail'
      const rep = kit.replacementColors[accent] ?? '--brand-color-signal'
      detail = `Banned color ${accent}. Use ${rep} instead.`
    } else if (!onPalette) {
      severity = 'warn'
      detail = `${accent} is not on the brand palette.`
    }
    checks.push({
      id: 'custom-accent',
      label: 'Custom accent colour',
      severity,
      detail,
    })
  } else {
    checks.push({
      id: 'custom-accent',
      label: 'Custom accent colour',
      severity: 'pass',
      detail: 'No custom accent set.',
    })
  }

  const radiusOk = deckRadiusPx <= kit.maxRectRadiusPx
  checks.push({
    id: 'radius',
    label: 'Corner radius',
    severity: radiusOk ? 'pass' : 'fail',
    detail: radiusOk
      ? `Deck uses ${deckRadiusPx}px (max ${kit.maxRectRadiusPx}px).`
      : `Radius ${deckRadiusPx}px exceeds max ${kit.maxRectRadiusPx}px.`,
  })

  const ink = kit.tokens['--brand-color-ink'] ?? '#14161a'
  const paper = kit.tokens['--brand-color-paper'] ?? '#f6f1e7'
  const ratio = contrastRatio(ink, paper)
  const contrastOk = ratio >= 4.5
  checks.push({
    id: 'contrast',
    label: 'Text contrast (WCAG AA)',
    severity: contrastOk ? 'pass' : 'fail',
    detail: `Body text on paper: ${ratio.toFixed(2)}:1 (need ≥ 4.5:1).`,
  })

  const headlineLen = outline.title.length
  let hlSeverity: CheckSeverity = 'pass'
  if (headlineLen > kit.maxHeadlineChars) hlSeverity = 'fail'
  else if (headlineLen > kit.maxHeadlineChars - 12) hlSeverity = 'warn'
  checks.push({
    id: 'headline',
    label: 'Headline length',
    severity: hlSeverity,
    detail: `${headlineLen} characters (max ${kit.maxHeadlineChars}).`,
  })

  return checks
}
