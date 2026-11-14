import { describe, expect, test } from "bun:test"
import {
  captionTrackMode,
  clampSeekTime,
  clampVolume,
  finiteDuration,
  isCaptionTrack,
  isMediaPlaying,
  normalizePlaybackRate,
} from "./useMediaElement"

describe("media element bounds", () => {
  test("clamps seeks inside a known timeline and leaves an unknown one open", () => {
    expect(clampSeekTime(12, -30, 90)).toBe(0)
    expect(clampSeekTime(80, 15, 90)).toBe(90)
    expect(clampSeekTime(10, 5, 90)).toBe(15)
    expect(clampSeekTime(4, 10, 0)).toBe(14)
    expect(clampSeekTime(4, 10, Number.NaN)).toBe(14)
  })

  test("clamps volume to 0..1", () => {
    expect(clampVolume(-0.2)).toBe(0)
    expect(clampVolume(0.35)).toBe(0.35)
    expect(clampVolume(1.4)).toBe(1)
  })

  test("snaps unknown playback rates back to 1x", () => {
    expect(normalizePlaybackRate(0.5)).toBe(0.5)
    expect(normalizePlaybackRate(1.25)).toBe(1.25)
    expect(normalizePlaybackRate(2)).toBe(2)
    expect(normalizePlaybackRate(1.1)).toBe(1)
    expect(normalizePlaybackRate(0)).toBe(1)
  })

  test("treats paused or ended media as not playing", () => {
    expect(isMediaPlaying(false, false)).toBe(true)
    expect(isMediaPlaying(true, false)).toBe(false)
    expect(isMediaPlaying(false, true)).toBe(false)
  })

  test("collapses a missing duration to zero", () => {
    expect(finiteDuration(12.5)).toBe(12.5)
    expect(finiteDuration(0)).toBe(0)
    expect(finiteDuration(Number.NaN)).toBe(0)
  })

  test("changes caption and subtitle tracks only", () => {
    expect(isCaptionTrack("captions")).toBe(true)
    expect(isCaptionTrack("subtitles")).toBe(true)
    expect(isCaptionTrack("metadata")).toBe(false)
    expect(isCaptionTrack("chapters")).toBe(false)
    expect(captionTrackMode(true)).toBe("showing")
    expect(captionTrackMode(false)).toBe("hidden")
  })
})
