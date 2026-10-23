import { describe, expect, test } from 'bun:test'
import { installCommand } from './install-command'

describe('installCommand', () => {
  test('builds the documented shadcn registry URL', () => {
    expect(installCommand('mesh-gradient')).toBe(
      'npx shadcn@latest add https://gradients.sh/r/mesh-gradient.json',
    )
  })
})
