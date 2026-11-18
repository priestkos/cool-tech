import { describe, expect, test } from 'bun:test'
import { resolveMomentMode } from './moment-view'

describe('resolveMomentMode', () => {
  test('playing overrides phase', () => {
    expect(resolveMomentMode('before', true)).toBe('play')
    expect(resolveMomentMode('after', true)).toBe('play')
  })

  test('still frames follow phase when not playing', () => {
    expect(resolveMomentMode('before', false)).toBe('before')
    expect(resolveMomentMode('after', false)).toBe('after')
  })
})