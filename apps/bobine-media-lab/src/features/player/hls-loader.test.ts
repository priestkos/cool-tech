import { describe, expect, test } from "bun:test"
import { shouldUseHlsLoader, attachHlsPlayback, resetHlsModuleLoadedFlagForTests } from "./hls-loader"

describe("hls loader gate", () => {
  test("detects m3u8 sources only", () => {
    expect(shouldUseHlsLoader("/fixtures/hls/playlist.m3u8")).toBe(true)
    expect(shouldUseHlsLoader("/fixtures/test-clip.mp4")).toBe(false)
    expect(shouldUseHlsLoader(undefined)).toBe(false)
  })

  test("rejects mp4 without importing", async () => {
    resetHlsModuleLoadedFlagForTests()
    const video = { canPlayType: () => "" } as HTMLVideoElement
    const result = await attachHlsPlayback(video, "/fixtures/test-clip.mp4")
    expect(result.ok).toBe(false)
    expect(result.error).toBe("not-hls")
  })
})