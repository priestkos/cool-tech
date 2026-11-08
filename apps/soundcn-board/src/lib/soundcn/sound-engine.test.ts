import { describe, expect, test, beforeEach } from "bun:test"
import {
  _resetAudioEngineForTests,
  decodeAudioData,
  getAudioContext,
  isAudioUnlocked,
  unlockAudioEngine,
} from "./sound-engine"

describe("sound-engine unlock gate", () => {
  beforeEach(() => {
    _resetAudioEngineForTests()
  })

  test("blocks context and decode before unlock", () => {
    expect(isAudioUnlocked()).toBe(false)
    expect(() => getAudioContext()).toThrow(/locked/i)
    expect(() => decodeAudioData("data:audio/wav;base64,AAAA")).toThrow(/before the user/i)
  })

  test("allows unlock from gesture entry point", () => {
    unlockAudioEngine()
    expect(isAudioUnlocked()).toBe(true)
  })
})
