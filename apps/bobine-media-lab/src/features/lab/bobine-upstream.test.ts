import { describe, expect, test } from "bun:test"
import {
  createMediaStore,
  describeMediaError,
  formatTime,
} from "bobinejs"

describe("bobinejs formatTime", () => {
  test("formats mm:ss", () => {
    expect(formatTime(65)).toBe("1:05")
    expect(formatTime(0)).toBe("0:00")
  })

  test("uses hour field when reference is long", () => {
    expect(formatTime(65, 3605)).toBe("0:01:05")
  })
})

describe("bobinejs describeMediaError", () => {
  test("maps known media error codes", () => {
    expect(describeMediaError({ code: 1, message: "" } as MediaError)).toContain("aborted")
    expect(describeMediaError({ code: 4, message: "" } as MediaError)).toMatch(/load/i)
    expect(describeMediaError(null)).toMatch(/wrong/i)
  })
})

describe("bobinejs createMediaStore", () => {
  test("seekBy updates currentTime from attached element", () => {
    const store = createMediaStore()
    const el = {
      currentTime: 12,
      duration: 120,
      paused: true,
      ended: false,
      muted: false,
      volume: 1,
      playbackRate: 1,
      buffered: { length: 0, start: () => 0, end: () => 0 },
      textTracks: { length: 0, addEventListener: () => {}, removeEventListener: () => {} },
      readyState: 4,
      src: "/fixtures/test-clip.mp4",
      load: () => {},
      play: async () => {},
      pause: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelectorAll: () => [],
    } as unknown as HTMLVideoElement

    store.attach(el)
    store.seekBy(8)
    expect(el.currentTime).toBe(20)
    store.setVolume(0.5)
    expect(el.volume).toBe(0.5)
  })
})