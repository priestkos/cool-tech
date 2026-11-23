import { describe, expect, test } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import path from "node:path"
import { decodeAsog, openAsog } from "../../../vendor/animated-sog/js/src/core/decode.js"
import { CLIPS } from "./clips"
import { createPlaybackClock } from "./playbackClock"

const ROOT = path.join(import.meta.dir, "../../..")
const VENDOR = path.join(ROOT, "vendor", "animated-sog", "test-data")

describe("vendored animated-sog decode", () => {
  test.each(Object.entries(CLIPS) as [keyof typeof CLIPS, (typeof CLIPS)[keyof typeof CLIPS]][])(
    "%s file bytes and manifest.count from real decoder",
    async (_id, clip) => {
      const bytes = readFileSync(path.join(VENDOR, path.basename(clip.path)))
      expect(bytes.byteLength).toBe(clip.expectedBytes)
      const file = await openAsog(bytes.buffer)
      const expected = _id === "rubloff-1s" ? 105_000 : 400_000
      expect(file.manifest.count).toBe(expected)
      const data = await decodeAsog(file, { audio: false, keep: ["means_l"] })
      expect(data.count).toBe(file.manifest.count)
      expect(data.stats.fileBytes).toBe(clip.expectedBytes)
    },
  )
})

describe("playback clock", () => {
  test("scrub updates base time while paused", () => {
    const clock = createPlaybackClock(false)
    clock.set(1.25)
    expect(clock.now()).toBeCloseTo(1.25, 5)
    clock.toggle()
    expect(clock.playing).toBe(true)
    clock.set(2.5)
    clock.toggle()
    expect(clock.playing).toBe(false)
    expect(clock.now()).toBeCloseTo(2.5, 5)
  })
})

describe("vendor file hashes", () => {
  test("decode.js matches pin SHA256", () => {
    const pin = "1bd0180597a0e607b8675d90825fc0dcbb254ff85327350a13ba7b179013d43b"
    const local = createHash("sha256")
      .update(readFileSync(path.join(ROOT, "vendor/animated-sog/js/src/three/AsogThreePlayer.js")))
      .digest("hex")
    expect(local).toBe(pin)
  })
})