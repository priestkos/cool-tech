import { describe, expect, test } from 'bun:test'
import { createTimeline } from './timeline'

describe('createTimeline', () => {
  test('runs beats in order with their delays', async () => {
    const order: number[] = []
    const tl = createTimeline()
    tl.play([
      { delayMs: 10, action: () => order.push(1) },
      { delayMs: 20, action: () => order.push(2) },
      { delayMs: 5, action: () => order.push(3) },
    ])
    await new Promise((r) => setTimeout(r, 50))
    expect(order).toEqual([1, 2, 3])
  })

  test('snap resets without running remaining beats', async () => {
    let ran = false
    const tl = createTimeline()
    tl.play([{ delayMs: 500, action: () => (ran = true) }])
    tl.snap(() => undefined)
    await new Promise((r) => setTimeout(r, 60))
    expect(ran).toBe(false)
    expect(tl.isRunning()).toBe(false)
  })

  test('cancelled replay leaves consistent idle state', async () => {
    const tl = createTimeline()
    let value = 0
    tl.play([
      { delayMs: 5, action: () => (value = 1) },
      { delayMs: 500, action: () => (value = 2) },
    ])
    await new Promise((r) => setTimeout(r, 15))
    tl.cancel()
    expect(value).toBe(1)
    await new Promise((r) => setTimeout(r, 600))
    expect(value).toBe(1)
    expect(tl.isRunning()).toBe(false)
  })
})
