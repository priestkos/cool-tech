import { describe, expect, test } from 'bun:test'
import { EASE, css as easeCss } from '../../vendor/stageshow/kit/ease.ts'

describe('vendored Stageshow ease API', () => {
  test('EASE exposes house motion curves used by Act waits', () => {
    expect(EASE.house).toHaveLength(4)
    expect(EASE.camera).toHaveLength(4)
    expect(easeCss('house')).toBe('cubic-bezier(0.65, 0, 0.1, 1)')
  })

  test('css accepts custom bezier tuples', () => {
    expect(easeCss([0.25, 0.8, 0.25, 1])).toBe('cubic-bezier(0.25, 0.8, 0.25, 1)')
  })
})