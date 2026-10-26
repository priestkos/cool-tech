import { describe, expect, test } from 'bun:test'
import { getTemplate } from './templates'
import { parseCompositionMeta, validateComposition } from './composition'

describe('composition helpers', () => {
  test('starter templates validate', () => {
    for (const t of ['title-card', 'kinetic-quote', 'product-launch'] as const) {
      const html = getTemplate(t).html
      const v = validateComposition(html)
      expect(v.ok).toBe(true)
      const meta = parseCompositionMeta(html)
      expect(meta.compositionId).toBe(t)
      expect(meta.duration).toBeGreaterThan(4)
    }
  })

  test('flags missing composition id', () => {
    const v = validateComposition('<html><body></body></html>')
    expect(v.ok).toBe(false)
    expect(v.issues.some((i) => i.includes('composition-id'))).toBe(true)
  })
})
