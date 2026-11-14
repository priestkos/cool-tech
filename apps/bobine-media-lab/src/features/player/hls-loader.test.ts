import { describe, expect, test } from "bun:test"
import {
  attachHlsPlayback,
  clearHlsLoadLog,
  getHlsLoadLog,
  resetHlsModuleLoadedFlagForTests,
  shouldUseHlsLoader,
} from "./hls-loader"

describe("hls loader gate", () => {
  test("detects m3u8 sources only", () => {
    expect(shouldUseHlsLoader("/fixtures/hls/playlist.m3u8")).toBe(true)
    expect(shouldUseHlsLoader("/fixtures/test-clip.mp4")).toBe(false)
    expect(shouldUseHlsLoader(undefined)).toBe(false)
  })

  test("uses the URL path, not a query or extension lookalike", () => {
    expect(shouldUseHlsLoader("/fixtures/hls/playlist.m3u8?token=1#t=2")).toBe(true)
    expect(shouldUseHlsLoader("https://cdn.example/live/index.m3u8")).toBe(true)
    expect(shouldUseHlsLoader("/video.mp4?file=playlist.m3u8")).toBe(false)
    expect(shouldUseHlsLoader("/fixtures/playlist.m3u8.bak")).toBe(false)
    expect(shouldUseHlsLoader("")).toBe(false)
  })

  test("falls back to the raw string when the URL parser rejects it", () => {
    expect(shouldUseHlsLoader("http://[::1/playlist.m3u8")).toBe(true)
    expect(shouldUseHlsLoader("http://[::1/clip.mp4")).toBe(false)
  })

  test("rejects mp4 without importing", async () => {
    resetHlsModuleLoadedFlagForTests()
    clearHlsLoadLog()
    const video = { canPlayType: () => "" } as HTMLVideoElement
    const result = await attachHlsPlayback(video, "/fixtures/test-clip.mp4")
    expect(result.ok).toBe(false)
    expect(result.error).toBe("not-hls")
    expect(getHlsLoadLog()).toEqual([])
  })
})