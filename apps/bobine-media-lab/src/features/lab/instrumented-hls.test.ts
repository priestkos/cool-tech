import { describe, expect, test } from "bun:test"
import {
  instrumentedHlsLoader,
  resetHlsTelemetryForTests,
  shouldUseHlsLoader,
  getHlsLoadLog,
} from "./instrumented-hls"

describe("instrumented bobine hlsLoader", () => {
  test("detects m3u8 sources only", () => {
    expect(shouldUseHlsLoader("/fixtures/hls/playlist.m3u8")).toBe(true)
    expect(shouldUseHlsLoader("/fixtures/hls/stream.m3u8?token=1")).toBe(true)
    expect(shouldUseHlsLoader("/fixtures/test-clip.mp4")).toBe(false)
    expect(shouldUseHlsLoader(undefined)).toBe(false)
  })

  test("skips telemetry for non-HLS sources", () => {
    resetHlsTelemetryForTests()
    const video = {
      canPlayType: () => "",
      src: "",
      load: () => {},
      removeAttribute: () => {},
    } as unknown as HTMLVideoElement

    instrumentedHlsLoader(video, "/fixtures/test-clip.mp4")
    expect(getHlsLoadLog()).toHaveLength(0)
  })

  test("logs when HLS adapter runs", () => {
    resetHlsTelemetryForTests()
    const prevNavigator = globalThis.navigator
    globalThis.navigator = { vendor: "" } as Navigator
    try {
      const video = {
        canPlayType: () => "",
        src: "",
        load: () => {},
        removeAttribute: () => {},
      } as unknown as HTMLVideoElement

      instrumentedHlsLoader(video, "/fixtures/hls/playlist.m3u8")
      expect(getHlsLoadLog()).toHaveLength(1)
      expect(getHlsLoadLog()[0]?.message).toContain("hlsLoader")
    } finally {
      globalThis.navigator = prevNavigator
    }
  })
})