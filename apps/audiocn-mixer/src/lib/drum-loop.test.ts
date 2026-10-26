import { describe, expect, it } from 'vitest'
import { analyzeDrumLoop, createDrumLoopBuffer } from './drum-loop'

function stubAudioContext(): BaseAudioContext {
  return {
    createBuffer(channels: number, length: number, sampleRate: number) {
      const data = Array.from(
        { length: channels },
        () => new Float32Array(length),
      )
      return {
        numberOfChannels: channels,
        length,
        sampleRate,
        getChannelData(index: number) {
          return data[index]
        },
      } as AudioBuffer
    },
  } as BaseAudioContext
}

describe('createDrumLoopBuffer', () => {
  it('produces a non-empty buffer without NaN and peak under 0 dBFS', () => {
    const buffer = createDrumLoopBuffer(stubAudioContext())
    const stats = analyzeDrumLoop(buffer)
    expect(stats.length).toBeGreaterThan(48_000)
    expect(stats.hasNaN).toBe(false)
    expect(stats.peak).toBeLessThan(1)
    expect(stats.peak).toBeGreaterThan(0.01)
  })
})
