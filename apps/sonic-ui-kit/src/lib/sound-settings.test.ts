import { describe, expect, test } from 'bun:test'
import type { SoundId } from './sound-catalog'
import {
  DEFAULT_SETTINGS,
  parseSoundSettings,
  serializeSoundSettings,
} from './sound-settings'

describe('sound settings persistence', () => {
  test('round-trips volume, mute, and component map', () => {
    const settings = {
      ...DEFAULT_SETTINGS,
      volume: 0.42,
      muted: true,
      componentSounds: {
        ...DEFAULT_SETTINGS.componentSounds,
        button: 'bloom' as SoundId,
      },
    }
    const restored = parseSoundSettings(serializeSoundSettings(settings))
    expect(restored.volume).toBe(0.42)
    expect(restored.muted).toBe(true)
    expect(restored.componentSounds.button).toBe('bloom')
  })

  test('clamps invalid volume and falls back on bad JSON', () => {
    const over = parseSoundSettings(
      serializeSoundSettings({ ...DEFAULT_SETTINGS, volume: 4 }),
    )
    expect(over.volume).toBe(1)
    const broken = parseSoundSettings('{not json')
    expect(broken.volume).toBe(DEFAULT_SETTINGS.volume)
  })
})
