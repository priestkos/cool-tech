import { describe, expect, test } from 'bun:test'
import {
  DEFAULT_STUDIO_SETTINGS,
  edgeSmearToUniform,
  glassParamsFromStudio,
  studioSettingsFromJson,
  studioSettingsToJson,
} from './settings'

describe('studio settings JSON', () => {
  test('round-trips through JSON', () => {
    const custom = { ...DEFAULT_STUDIO_SETTINGS, opticalDepth: 1.5, edgeSmear: 2.1 }
    const json = studioSettingsToJson(custom)
    const parsed = studioSettingsFromJson(json)
    expect(parsed).toEqual(custom)
  })
})

describe('slider to uniform mapping', () => {
  test('edge smear maps to uStreak', () => {
    const params = glassParamsFromStudio(DEFAULT_STUDIO_SETTINGS)
    const low = edgeSmearToUniform(0.5, { ...params, edgeSmear: 0.5 })
    const high = edgeSmearToUniform(2.5, { ...params, edgeSmear: 2.5 })
    expect(high).toBeGreaterThan(low)
    expect(high).toBe(2.5)
  })
})
