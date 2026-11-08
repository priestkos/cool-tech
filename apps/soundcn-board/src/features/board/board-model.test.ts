import { describe, expect, test } from "bun:test"
import {
  appendLog,
  canEmitSound,
  clampVolume,
  isPresetId,
} from "./board-model"
const PRESET_IDS = [
  "click-soft",
  "switch-on",
  "switch-off",
  "notification-pop",
  "confirmation-001",
] as const

describe("clampVolume", () => {
  test("clamps high and low", () => {
    expect(clampVolume(1.5)).toBe(1)
    expect(clampVolume(-0.2)).toBe(0)
    expect(clampVolume(0.42)).toBe(0.42)
  })
})

describe("canEmitSound", () => {
  test("requires unlock and not muted", () => {
    expect(canEmitSound(false, false)).toBe(false)
    expect(canEmitSound(true, true)).toBe(false)
    expect(canEmitSound(true, false)).toBe(true)
  })
})

describe("preset mapping", () => {
  test("recognizes catalog ids", () => {
    for (const id of PRESET_IDS) {
      expect(isPresetId(id)).toBe(true)
    }
    expect(isPresetId("wow-loot")).toBe(false)
  })
})

describe("appendLog", () => {
  test("trims to max", () => {
    let log = appendLog([], "a", () => "1")
    log = appendLog(log, "b", () => "2")
    expect(log).toHaveLength(2)
  })
})
