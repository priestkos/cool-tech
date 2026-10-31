import { describe, expect, test } from 'bun:test'
import { buildDeckHtml, deckHasExternalUrls, deckUsesBrandTokens, extractUserTextEscaped } from './build-deck'
import { exampleStudio } from './brands/kits'
import { getFormat } from './formats'
import { buildSlidePlan, parseBrief } from './parse-brief'

const SAMPLE = `Roadmap review

- Cache drops p95 from 820 ms to 410 ms
- Dashboards support 12 editors
- Adoption target 38% by January`

describe('parseBrief', () => {
  test('extracts title and bullets', () => {
    const text = `Launch update\n\n- First point\n- Second point with 42% growth`
    const o = parseBrief(text)
    expect(o.title).toBe('Launch update')
    expect(o.bullets.length).toBeGreaterThanOrEqual(2)
    expect(o.stats.some((s) => s.value.includes('42'))).toBe(true)
  })

  test('empty input throws', () => {
    expect(() => parseBrief('   ')).toThrow(/empty/i)
  })

  test('deterministic seed', () => {
    const a = parseBrief('Hello world\n\n- a')
    const b = parseBrief('Hello world\n\n- a')
    expect(a.seed).toBe(b.seed)
  })
})

describe('buildSlidePlan', () => {
  test('respects slide count bounds', () => {
    const o = parseBrief(SAMPLE)
    expect(buildSlidePlan(o, 3).length).toBe(3)
    expect(buildSlidePlan(o, 8).length).toBe(8)
  })
})

describe('buildDeckHtml', () => {
  test('escapes script tags in brief text', () => {
    const evil = '<script>alert(1)</script>'
    const outline = parseBrief(`${evil}\n\n- safe`)
    const slides = buildSlidePlan(outline, 3)
    const html = buildDeckHtml({
      kit: exampleStudio,
      format: getFormat('slide'),
      slides,
      fontFaces: [],
    })
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(extractUserTextEscaped(evil, html)).toBe(true)
  })

  test('applies brand tokens and avoids external URLs', () => {
    const outline = parseBrief(SAMPLE)
    const slides = buildSlidePlan(outline, 5)
    const html = buildDeckHtml({
      kit: exampleStudio,
      format: getFormat('slide'),
      slides,
      fontFaces: [],
    })
    expect(deckUsesBrandTokens(html)).toBe(true)
    expect(deckHasExternalUrls(html)).toBe(false)
  })
})
