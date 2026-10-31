// From langchain-ai/design-agent @ 9fd563b, Example Studio sample brand (CC0-1.0)
import type { BrandKit } from './types'

const exampleStudioMark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Example Studio"><title>Example Studio</title><g transform="translate(0 0)"><rect x="4" y="4" width="56" height="56" rx="10" fill="none" stroke="#14161a" stroke-width="6"/><path d="M7 42H57" stroke="#14161a" stroke-width="6"/><circle cx="43" cy="21" r="8" fill="#ff5a36"/></g></svg>`

export const exampleStudio: BrandKit = {
  id: 'example-studio',
  name: 'Example Studio',
  slug: 'example-studio',
  voice:
    'Plain, warm and exact. Short sentences, concrete nouns, figures with units.',
  allowedColors: [
    '#14161a',
    '#f6f1e7',
    '#ffffff',
    '#ff5a36',
    '#2f6b4f',
    '#8bb8e8',
    '#e8dcc4',
    '#4a4f57',
    '#d9dde3',
  ],
  extendedPalette: [
    '#ff8a6b',
    '#ffc2b0',
    '#5c9474',
    '#a9d2bc',
    '#3d73b0',
    '#b9d5f2',
    '#8a8f97',
    '#f1e9da',
  ],
  bannedColors: ['#000000', '#ff0000', '#00ff00', '#0000ff', '#ff00ff'],
  replacementColors: {
    '#000000': '--brand-color-ink',
    '#ff0000': '--brand-color-signal',
  },
  maxRectRadiusPx: 12,
  fontStacks: {
    display: ['Geist', 'system-ui', 'sans-serif'],
    text: ['Geist', 'system-ui', 'sans-serif'],
    mono: ['Fragment Mono', 'Fira Code', 'ui-monospace', 'monospace'],
  },
  fontFiles: {
    display: { family: 'Geist', file: 'Geist-Variable.ttf', weight: '100 900' },
    mono: { family: 'Fragment Mono', file: 'FragmentMono-Regular.ttf', weight: '400' },
  },
  tokens: {
    '--brand-color-ink': '#14161a',
    '--brand-color-paper': '#f6f1e7',
    '--brand-color-white': '#ffffff',
    '--brand-color-signal': '#ff5a36',
    '--brand-color-moss': '#2f6b4f',
    '--brand-color-sky': '#8bb8e8',
    '--brand-color-sand': '#e8dcc4',
    '--brand-color-graphite': '#4a4f57',
    '--brand-color-mist': '#d9dde3',
    '--brand-radius-sm': '4px',
    '--brand-radius-md': '8px',
    '--brand-radius-lg': '12px',
    '--brand-space-unit': '8px',
    '--brand-weight-display': '300',
    '--brand-weight-text': '400',
    '--brand-weight-strong': '500',
    '--brand-tracking-display': '-0.02em',
  },
  markSvg: exampleStudioMark,
  maxHeadlineChars: 72,
}

/** Original fictional kit — editorial serif palette (not a real company). */
const ledgerMark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true"><rect x="6" y="6" width="52" height="52" rx="6" fill="none" stroke="#1c1917" stroke-width="4"/><path d="M18 46V18h12c8 0 14 5 14 14s-6 14-14 14H18z" fill="none" stroke="#1c1917" stroke-width="4"/></svg>`

export const ledgerLine: BrandKit = {
  id: 'ledger-line',
  name: 'Ledger & Line',
  slug: 'ledger-line',
  voice: 'Editorial and measured. Serif display, crisp figures, no hype.',
  allowedColors: [
    '#1c1917',
    '#faf7f2',
    '#ffffff',
    '#9a3412',
    '#365314',
    '#4b5563',
    '#d6d3d1',
    '#78716c',
    '#e7e5e4',
  ],
  extendedPalette: ['#c2410c', '#84cc16', '#57534e', '#f5f5f4'],
  bannedColors: ['#000000', '#ff0000', '#00ff00', '#0000ff'],
  replacementColors: {
    '#000000': '--brand-color-ink',
    '#ff0000': '--brand-color-signal',
  },
  maxRectRadiusPx: 12,
  fontStacks: {
    display: ['Fraunces', 'Georgia', 'serif'],
    text: ['Fraunces', 'Georgia', 'serif'],
    mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
  },
  fontFiles: {
    display: { family: 'Fraunces', file: 'Fraunces-Variable.ttf', weight: '100 900' },
    mono: { family: 'IBM Plex Mono', file: 'IBMPlexMono-Regular.ttf', weight: '400' },
  },
  tokens: {
    '--brand-color-ink': '#1c1917',
    '--brand-color-paper': '#faf7f2',
    '--brand-color-white': '#ffffff',
    '--brand-color-signal': '#9a3412',
    '--brand-color-moss': '#365314',
    '--brand-color-sky': '#78716c',
    '--brand-color-sand': '#e7e5e4',
    '--brand-color-graphite': '#4b5563',
    '--brand-color-mist': '#d6d3d1',
    '--brand-radius-sm': '4px',
    '--brand-radius-md': '8px',
    '--brand-radius-lg': '12px',
    '--brand-space-unit': '8px',
    '--brand-weight-display': '400',
    '--brand-weight-text': '400',
    '--brand-weight-strong': '600',
    '--brand-tracking-display': '-0.01em',
  },
  markSvg: ledgerMark,
  maxHeadlineChars: 68,
}

/** Original fictional kit — high-contrast tech palette (not a real company). */
const nexusMark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true"><path d="M8 8h20v20H8zM36 8h20v20H36zM8 36h20v20H8z" fill="none" stroke="#0f172a" stroke-width="4"/><path d="M46 36h10v10H46z" fill="#22d3ee"/></svg>`

export const nexusGrid: BrandKit = {
  id: 'nexus-grid',
  name: 'Nexus Grid',
  slug: 'nexus-grid',
  voice: 'Direct and technical. High contrast, monospace for data, short labels.',
  allowedColors: [
    '#0f172a',
    '#f8fafc',
    '#ffffff',
    '#22d3ee',
    '#6366f1',
    '#94a3b8',
    '#e2e8f0',
    '#334155',
    '#cbd5e1',
  ],
  extendedPalette: ['#0891b2', '#818cf8', '#64748b', '#f1f5f9'],
  bannedColors: ['#000000', '#ff00ff', '#00ff00'],
  replacementColors: {
    '#000000': '--brand-color-ink',
  },
  maxRectRadiusPx: 12,
  fontStacks: {
    display: ['Inter', 'system-ui', 'sans-serif'],
    text: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'ui-monospace', 'monospace'],
  },
  fontFiles: {
    display: { family: 'Inter', file: 'Inter-Variable.ttf', weight: '100 900' },
    mono: { family: 'Fira Code', file: 'FiraCode-Variable.ttf', weight: '300 700' },
  },
  tokens: {
    '--brand-color-ink': '#0f172a',
    '--brand-color-paper': '#f8fafc',
    '--brand-color-white': '#ffffff',
    '--brand-color-signal': '#22d3ee',
    '--brand-color-moss': '#6366f1',
    '--brand-color-sky': '#94a3b8',
    '--brand-color-sand': '#e2e8f0',
    '--brand-color-graphite': '#334155',
    '--brand-color-mist': '#cbd5e1',
    '--brand-radius-sm': '4px',
    '--brand-radius-md': '8px',
    '--brand-radius-lg': '12px',
    '--brand-space-unit': '8px',
    '--brand-weight-display': '600',
    '--brand-weight-text': '400',
    '--brand-weight-strong': '700',
    '--brand-tracking-display': '-0.03em',
  },
  markSvg: nexusMark,
  maxHeadlineChars: 64,
}

export const BRAND_KITS: BrandKit[] = [exampleStudio, ledgerLine, nexusGrid]

export function getBrandKit(id: string): BrandKit {
  const kit = BRAND_KITS.find((k) => k.id === id)
  if (!kit) return exampleStudio
  return kit
}
