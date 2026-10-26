import { describe, expect, test } from 'bun:test'
import { getCapabilities } from './capabilities'

describe('capabilities', () => {
  test('parses doctor json on this machine', async () => {
    const caps = await getCapabilities()
    expect(caps.hyperframesVersion).toContain('0.8.186')
    expect(typeof caps.ffmpeg).toBe('boolean')
    expect(typeof caps.chrome).toBe('boolean')
    expect(caps.canRender).toBe(caps.ffmpeg && caps.chrome)
  })
})
