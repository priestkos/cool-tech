// Ported from glass-icon-reveal (MIT) — https://github.com/zanwei/glass-icon-reveal
// Neutral preset marks only (no upstream sample brand logos).

export type PresetId = 'diamond' | 'ring' | 'triangle' | 'pinwheel'

export interface PresetMeta {
  id: PresetId
  label: string
  color: boolean
  offset?: [number, number]
  lensShift?: [number, number]
  svg: string
}

export const PRESETS: Record<PresetId, PresetMeta> = {
  diamond: {
    id: 'diamond',
    label: 'Diamond',
    color: false,
    offset: [0, 0],
    lensShift: [0, -0.15],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#fff" d="M50 8 92 50 50 92 8 50Z"/></svg>',
  },
  ring: {
    id: 'ring',
    label: 'Ring',
    color: false,
    offset: [0, 0],
    lensShift: [0, 0],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#fff" fill-rule="evenodd" d="M50 12a38 38 0 1 1 0 76 38 38 0 0 1 0-76Zm0 18a20 20 0 1 0 0 40 20 20 0 0 0 0-40Z"/></svg>',
  },
  triangle: {
    id: 'triangle',
    label: 'Triangle',
    color: false,
    offset: [0, 0.02],
    lensShift: [0, -0.2],
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="#fff" d="M50 12 90 88H10Z"/></svg>',
  },
  pinwheel: {
    id: 'pinwheel',
    label: 'Pinwheel',
    color: true,
    svg:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
      '<path fill="#ff6a3d" d="M47 47V9A38 38 0 0 0 9 47Z"/>' +
      '<path fill="#ffc83d" d="M53 47H91A38 38 0 0 0 53 9Z"/>' +
      '<path fill="#36d38c" d="M53 53V91A38 38 0 0 0 91 53Z"/>' +
      '<path fill="#3d8bff" d="M47 53H9A38 38 0 0 0 47 91Z"/></svg>',
  },
}

export const PRESET_LIST = Object.values(PRESETS)
