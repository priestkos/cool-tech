// From langchain-ai/design-agent @ 9fd563b, Example Studio sample brand (CC0-1.0)
// Adapted to TypeScript for Design Agent Brief Studio (unofficial demo).

export type BrandKit = {
  id: string
  name: string
  slug: string
  voice: string
  tokens: Record<string, string>
  allowedColors: string[]
  extendedPalette: string[]
  bannedColors: string[]
  replacementColors: Record<string, string>
  maxRectRadiusPx: number
  fontStacks: {
    display: string[]
    text: string[]
    mono: string[]
  }
  fontFiles: {
    display: { family: string; file: string; weight?: string }
    mono: { family: string; file: string; weight?: string }
  }
  markSvg: string
  maxHeadlineChars: number
}

export type BrandKitId = 'example-studio' | 'ledger-line' | 'nexus-grid'
