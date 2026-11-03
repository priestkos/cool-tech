import { describe, expect, test } from 'bun:test'
import { composeExportSvg, validateExportSvg } from './export-svg'
import { DEFAULT_STUDIO_STATE } from './studio-state'
import { exportSvgFileName } from './download'

describe('export svg composer', () => {
  test('produces well-formed deterministic svg with ink resolved', () => {
    const state = { ...DEFAULT_STUDIO_STATE, framePreset: 'border' as const, frameSeed: 4 }
    const a = composeExportSvg({
      state,
      width: 480,
      height: 320,
      includeBackground: true,
    })
    const b = composeExportSvg({
      state,
      width: 480,
      height: 320,
      includeBackground: true,
    })
    expect(a).toBe(b)
    const check = validateExportSvg(a)
    expect(check.ok).toBe(true)
    expect(a).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(a).toContain(state.inkColor)
  })
})

describe('export file naming', () => {
  test('includes preset and seed', () => {
    expect(exportSvgFileName('block', 9)).toBe('alembic-block-seed-9.svg')
  })
})
