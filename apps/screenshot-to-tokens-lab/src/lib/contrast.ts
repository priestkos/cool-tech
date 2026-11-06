const HEX3 = /^#([0-9a-fA-F]{3})$/
const HEX6 = /^#([0-9a-fA-F]{6})$/

export function normalizeHex(input: string): string | null {
  const trimmed = input.trim()
  const six = HEX6.exec(trimmed)
  if (six) {
    return `#${six[1].toLowerCase()}`
  }
  const three = HEX3.exec(trimmed)
  if (three) {
    const [r, g, b] = three[1].split("")
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }
  return null
}

function channelToLinear(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
  const normalized = normalizeHex(hex)
  if (!normalized) {
    return 0
  }
  const raw = normalized.slice(1)
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  const rl = channelToLinear(r)
  const gl = channelToLinear(g)
  const bl = channelToLinear(b)
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg)
  const l2 = relativeLuminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export type ContrastPair = {
  id: string
  label: string
  foreground: string
  background: string
}

export type ContrastResult = ContrastPair & {
  ratio: number
  aaNormal: boolean
  aaLarge: boolean
}

export function evaluateContrastPair(pair: ContrastPair): ContrastResult {
  const fg = normalizeHex(pair.foreground) ?? "#000000"
  const bg = normalizeHex(pair.background) ?? "#ffffff"
  const ratio = contrastRatio(fg, bg)
  return {
    ...pair,
    foreground: fg,
    background: bg,
    ratio,
    aaNormal: ratio >= 4.5,
    aaLarge: ratio >= 3,
  }
}

export function buildPreviewContrastPairs(resolved: {
  text: string
  canvas: string
  card: string
  accent: string
  sidebar: string
}): ContrastPair[] {
  return [
    {
      id: "body-on-canvas",
      label: "Body text on canvas",
      foreground: resolved.text,
      background: resolved.canvas,
    },
    {
      id: "body-on-card",
      label: "Body text on card",
      foreground: resolved.text,
      background: resolved.card,
    },
    {
      id: "accent-on-canvas",
      label: "Accent on canvas",
      foreground: resolved.accent,
      background: resolved.canvas,
    },
    {
      id: "text-on-sidebar",
      label: "Muted label on sidebar",
      foreground: resolved.text,
      background: resolved.sidebar,
    },
  ]
}
