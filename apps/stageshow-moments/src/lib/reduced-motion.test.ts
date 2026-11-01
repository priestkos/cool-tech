import { describe, expect, test } from 'bun:test'
import { instantPhaseSwap, useReducedMotionEffective } from './reduced-motion'

describe('reduced motion', () => {
  test('demo switch simulates reduced motion', () => {
    expect(useReducedMotionEffective(false, true)).toBe(true)
    expect(useReducedMotionEffective(true, false)).toBe(true)
  })

  test('instant swap shows poster phase only', () => {
    expect(instantPhaseSwap('after', true)).toBe('after')
    expect(instantPhaseSwap('before', true)).toBe('before')
  })
})
