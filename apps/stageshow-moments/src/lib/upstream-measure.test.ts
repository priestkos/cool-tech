import { describe, expect, test } from 'bun:test'
import { inset } from '../../vendor/stageshow/kit/measure.ts'

describe('vendored Stageshow measure API', () => {
  test('inset expands hit targets around a rect', () => {
    const hit = inset({ x: 10, y: 10, width: 100, height: 50 }, 8)
    expect(hit).toEqual({ x: 2, y: 2, width: 116, height: 66 })
  })
})