import { describe, expect, test } from 'bun:test'
import { contrastRatio, runBrandChecks } from './brand-checks'
import { exampleStudio } from './brands/kits'
import { parseBrief } from './parse-brief'

describe('brand checks', () => {
  test('flags banned custom accent', () => {
    const outline = parseBrief('Title\n\n- one')
    const checks = runBrandChecks({
      kit: exampleStudio,
      outline,
      customAccent: '#ff0000',
    })
    const accent = checks.find((c) => c.id === 'custom-accent')
    expect(accent?.severity).toBe('fail')
  })

  test('WCAG contrast for ink on paper passes', () => {
    const ratio = contrastRatio('#14161a', '#f6f1e7')
    expect(ratio).toBeGreaterThan(4.5)
  })
})
