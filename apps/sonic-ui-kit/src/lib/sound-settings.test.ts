import { describe, expect, it } from "vitest"
import {
  DEFAULT_SOUND_SETTINGS,
  parseSoundSettings,
  saveSoundSettings,
  loadSoundSettings,
  applyReducedMotionDefault,
} from "./sound-settings"

describe("sound-settings persistence", () => {
  it("round-trips volume, mute, and component map", () => {
    const storage = new Map<string, string>()
    const mock = {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => storage.set(k, v),
    }
    saveSoundSettings(mock, {
      ...DEFAULT_SOUND_SETTINGS,
      volume: 0.42,
      muted: true,
      componentSounds: {
        ...DEFAULT_SOUND_SETTINGS.componentSounds,
        button: "ding",
      },
    })
    const loaded = loadSoundSettings(mock)
    expect(loaded.volume).toBe(0.42)
    expect(loaded.muted).toBe(true)
    expect(loaded.componentSounds.button).toBe("ding")
  })

  it("ignores invalid JSON and clamps volume", () => {
    const parsed = parseSoundSettings('{"volume": 9, "muted": "nope"}')
    expect(parsed.volume).toBe(1)
    expect(parsed.muted).toBe(false)
  })

  it("applies reduced-motion defaults only without stored settings", () => {
    const quiet = applyReducedMotionDefault(
      DEFAULT_SOUND_SETTINGS,
      true,
      false,
    )
    expect(quiet.muted).toBe(true)
    const unchanged = applyReducedMotionDefault(
      DEFAULT_SOUND_SETTINGS,
      true,
      true,
    )
    expect(unchanged.muted).toBe(false)
  })
})
