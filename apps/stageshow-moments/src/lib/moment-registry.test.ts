import { describe, expect, test } from 'bun:test'
import { MOMENTS, validateMomentRegistry } from './moment-registry'

describe('moment registry', () => {
  test('each moment has poster, phases, and 3–7 real strings', () => {
    expect(validateMomentRegistry(MOMENTS)).toEqual([])
    for (const m of MOMENTS) {
      expect(m.poster === 'before' || m.poster === 'after').toBe(true)
      expect(m.realStrings.length).toBeGreaterThanOrEqual(3)
      expect(m.realStrings.length).toBeLessThanOrEqual(7)
    }
  })
})
