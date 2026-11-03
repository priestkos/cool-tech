import { describe, expect, test } from 'bun:test'
import { normalizeFrame, normalizeParams } from '@lauriparonen/alembic-ornaments'
import {
  DEFAULT_STUDIO_STATE,
  normalizeStudioState,
  studioStateFromSearchParams,
  studioStateToSearchParams,
} from './studio-state'

describe('studio state URL round-trip', () => {
  test('coerces bad frame and divider input via library normalisers', () => {
    const state = normalizeStudioState({
      f: 'not-a-frame',
      s: 'not-a-number',
      dp: 'garbage',
      ds: -5,
    })
    expect(state.framePreset).toBe(normalizeFrame({ preset: 'border', seed: 4 })?.preset)
    expect(state.dividerPreset).toBe(normalizeParams({ preset: 'vine', seed: 1 }).preset)
    expect(state.frameSeed).toBe(DEFAULT_STUDIO_STATE.frameSeed)
  })

  test('round-trips layout fields through search params', () => {
    const original = {
      ...DEFAULT_STUDIO_STATE,
      framePreset: 'corners' as const,
      frameSeed: 12,
      frameSize: 48,
      frameClear: 'edges' as const,
      inkColor: '#336699',
      layout: 'quote' as const,
      title: 'Emily Dickinson',
      body: 'Hope is the thing with feathers.',
      dividerEnabled: false,
      cardWidth: 520,
      cardHeight: 360,
    }
    const restored = studioStateFromSearchParams(studioStateToSearchParams(original))
    expect(restored.framePreset).toBe(original.framePreset)
    expect(restored.frameSeed).toBe(original.frameSeed)
    expect(restored.frameSize).toBe(original.frameSize)
    expect(restored.frameClear).toBe(original.frameClear)
    expect(restored.inkColor).toBe(original.inkColor)
    expect(restored.layout).toBe(original.layout)
    expect(restored.title).toBe(original.title)
    expect(restored.body).toBe(original.body)
    expect(restored.dividerEnabled).toBe(false)
    expect(restored.cardWidth).toBe(original.cardWidth)
    expect(restored.cardHeight).toBe(original.cardHeight)
  })
})
