import { describe, expect, test } from 'bun:test'
import { render } from '@testing-library/react'
import { DottyBotty } from 'dotty-botty'

describe('DottyBotty', () => {
  test('renders with a label', () => {
    const { container } = render(
      <DottyBotty state="idle" size={48} label="Test Dotty" reducedMotion />,
    )
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
