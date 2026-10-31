export type DeckFormatId = 'slide' | 'square' | 'portrait'

export type DeckFormat = {
  id: DeckFormatId
  label: string
  width: number
  height: number
}

export const DECK_FORMATS: DeckFormat[] = [
  { id: 'slide', label: '16:9 slide (1920×1080)', width: 1920, height: 1080 },
  { id: 'square', label: 'Square (1080×1080)', width: 1080, height: 1080 },
  { id: 'portrait', label: 'Portrait (1080×1350)', width: 1080, height: 1350 },
]

export function getFormat(id: DeckFormatId): DeckFormat {
  const format = DECK_FORMATS.find((f) => f.id === id)
  if (!format) {
    throw new Error(`Unknown format: ${id}`)
  }
  return format
}
