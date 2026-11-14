import { describe, expect, test } from "bun:test"
import { PLAYBACK_RATES } from "./shortcuts"

describe("playback and caption state", () => {
  test("speed menu includes 0.5x through 2x", () => {
    expect(PLAYBACK_RATES).toEqual([0.5, 0.75, 1, 1.25, 1.5, 2])
  })

  test("caption track mode mapping", () => {
    const track = { kind: "captions", mode: "hidden" as TextTrackMode }
    const enable = (on: boolean) => {
      track.mode = on ? "showing" : "hidden"
    }
    enable(true)
    expect(track.mode).toBe("showing")
    enable(false)
    expect(track.mode).toBe("hidden")
  })
})