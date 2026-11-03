import {
  normalizeFrame,
  normalizeParams,
  type FrameClear,
  type FramePreset,
  type OrnamentPreset,
} from '@lauriparonen/alembic-ornaments'

export type LayoutMode = 'card' | 'quote'

export interface StudioState {
  framePreset: FramePreset
  frameSeed: number
  frameSize: number
  frameClear: FrameClear
  inkColor: string
  layout: LayoutMode
  title: string
  body: string
  dividerEnabled: boolean
  dividerPreset: OrnamentPreset
  dividerSeed: number
  cardWidth: number
  cardHeight: number
}

export const DEFAULT_STUDIO_STATE: StudioState = {
  framePreset: 'border',
  frameSeed: 4,
  frameSize: 32,
  frameClear: 'ink',
  inkColor: '#1a1a1a',
  layout: 'card',
  title: 'Alembic Ornament Studio',
  body: 'Seeded woodcut frames and ornaments, drawn as SVG.',
  dividerEnabled: true,
  dividerPreset: 'vine',
  dividerSeed: 7,
  cardWidth: 480,
  cardHeight: 320,
}

const FRAME_PRESETS: FramePreset[] = ['border', 'block', 'corners']
const ORNAMENT_PRESETS: OrnamentPreset[] = ['vine', 'frieze', 'garland', 'sprig']

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.trunc(n)))
}

function parseHexColor(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') return fallback
  const v = raw.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase()
  if (/^[0-9a-fA-F]{6}$/.test(v)) return `#${v.toLowerCase()}`
  return fallback
}

function parseLayout(raw: unknown): LayoutMode {
  return raw === 'quote' ? 'quote' : 'card'
}

function parseFrameClear(raw: unknown): FrameClear {
  return raw === 'edges' ? 'edges' : 'ink'
}

function parseFramePreset(raw: unknown): FramePreset {
  const id = typeof raw === 'string' ? raw : ''
  return FRAME_PRESETS.includes(id as FramePreset) ? (id as FramePreset) : 'border'
}

function parseOrnamentPreset(raw: unknown): OrnamentPreset {
  const id = typeof raw === 'string' ? raw : ''
  return ORNAMENT_PRESETS.includes(id as OrnamentPreset)
    ? (id as OrnamentPreset)
    : 'vine'
}

/** Coerce partial URL input through library normalisers (never throws). */
export function normalizeStudioState(input: Partial<StudioState> & Record<string, unknown>): StudioState {
  const frameNorm = normalizeFrame({
    preset: parseFramePreset(input.framePreset ?? input.f),
    seed: clampInt(input.frameSeed ?? input.s, 0, 999_999, DEFAULT_STUDIO_STATE.frameSeed),
  })
  const dividerNorm = normalizeParams({
    preset: parseOrnamentPreset(input.dividerPreset ?? input.dp),
    seed: clampInt(input.dividerSeed ?? input.ds, 0, 999_999, DEFAULT_STUDIO_STATE.dividerSeed),
  })

  return {
    framePreset: frameNorm?.preset ?? DEFAULT_STUDIO_STATE.framePreset,
    frameSeed: frameNorm?.seed ?? DEFAULT_STUDIO_STATE.frameSeed,
    frameSize: clampInt(input.frameSize ?? input.w, 12, 64, DEFAULT_STUDIO_STATE.frameSize),
    frameClear: parseFrameClear(input.frameClear ?? input.cl),
    inkColor: parseHexColor(input.inkColor ?? input.col, DEFAULT_STUDIO_STATE.inkColor),
    layout: parseLayout(input.layout ?? input.mode),
    title: typeof input.title === 'string' && input.title.length > 0 ? input.title.slice(0, 120) : DEFAULT_STUDIO_STATE.title,
    body: typeof input.body === 'string' && input.body.length > 0 ? input.body.slice(0, 800) : DEFAULT_STUDIO_STATE.body,
    dividerEnabled:
      input.div === '0' || input.div === 0 || input.dividerEnabled === false
        ? false
        : input.div === '1' || input.div === 1 || input.dividerEnabled === true
          ? true
          : DEFAULT_STUDIO_STATE.dividerEnabled,
    dividerPreset: dividerNorm.preset,
    dividerSeed: dividerNorm.seed,
    cardWidth: clampInt(input.cardWidth ?? input.cw, 240, 900, DEFAULT_STUDIO_STATE.cardWidth),
    cardHeight: clampInt(input.cardHeight ?? input.ch, 180, 700, DEFAULT_STUDIO_STATE.cardHeight),
  }
}

export function studioStateToSearchParams(state: StudioState): URLSearchParams {
  const p = new URLSearchParams()
  p.set('f', state.framePreset)
  p.set('s', String(state.frameSeed))
  p.set('w', String(state.frameSize))
  if (state.frameClear !== 'ink') p.set('cl', state.frameClear)
  p.set('col', state.inkColor.replace('#', ''))
  p.set('mode', state.layout)
  if (state.title !== DEFAULT_STUDIO_STATE.title) p.set('title', state.title)
  if (state.body !== DEFAULT_STUDIO_STATE.body) p.set('body', state.body)
  if (state.dividerEnabled) p.set('div', '1')
  else p.set('div', '0')
  p.set('dp', state.dividerPreset)
  p.set('ds', String(state.dividerSeed))
  if (state.cardWidth !== DEFAULT_STUDIO_STATE.cardWidth) p.set('cw', String(state.cardWidth))
  if (state.cardHeight !== DEFAULT_STUDIO_STATE.cardHeight) p.set('ch', String(state.cardHeight))
  return p
}

export function studioStateFromSearchParams(search: URLSearchParams): StudioState {
  const raw: Record<string, unknown> = {
    f: search.get('f') ?? undefined,
    s: search.get('s') ?? undefined,
    w: search.get('w') ?? undefined,
    cl: search.get('cl') ?? undefined,
    col: search.get('col') ?? undefined,
    mode: search.get('mode') ?? undefined,
    title: search.get('title') ?? undefined,
    body: search.get('body') ?? undefined,
    div: search.get('div') ?? undefined,
    dp: search.get('dp') ?? undefined,
    ds: search.get('ds') ?? undefined,
    cw: search.get('cw') ?? undefined,
    ch: search.get('ch') ?? undefined,
  }
  return normalizeStudioState(raw)
}

export function readStudioStateFromLocation(): StudioState {
  if (typeof window === 'undefined') return DEFAULT_STUDIO_STATE
  return studioStateFromSearchParams(new URLSearchParams(window.location.search))
}

export function writeStudioStateToLocation(state: StudioState): void {
  const next = studioStateToSearchParams(state).toString()
  const url = next ? `${window.location.pathname}?${next}` : window.location.pathname
  window.history.replaceState(null, '', url)
}
