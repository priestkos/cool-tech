import { describe, expect, test } from "bun:test"
import { dispatchShortcutAction, type KeyboardHandlerContext } from "./useKeyboardShortcuts"
import { mapKeyToAction, formatTime } from "./shortcuts"

describe("mapKeyToAction", () => {
  test("maps play keys", () => {
    expect(mapKeyToAction(" ", "Space", {})).toBe("togglePlay")
    expect(mapKeyToAction("k", "KeyK", {})).toBe("togglePlay")
  })

  test("maps seek and volume", () => {
    expect(mapKeyToAction("j", "KeyJ", {})).toBe("seekBack10")
    expect(mapKeyToAction("l", "KeyL", {})).toBe("seekForward10")
    expect(mapKeyToAction("ArrowLeft", "ArrowLeft", {})).toBe("seekBackSmall")
    expect(mapKeyToAction("ArrowUp", "ArrowUp", {})).toBe("volumeUp")
  })

  test("ignores input fields", () => {
    expect(mapKeyToAction(" ", "Space", { typingInField: true })).toBeNull()
  })
})

describe("dispatchShortcutAction", () => {
  test("invokes handler branches", () => {
    const calls: string[] = []
    const ctx: KeyboardHandlerContext = {
      togglePlay: () => calls.push("play"),
      seekBy: (d) => calls.push(`seek:${d}`),
      adjustVolume: (d) => calls.push(`vol:${d}`),
      toggleMute: () => calls.push("mute"),
      toggleFullscreen: () => calls.push("fs"),
      toggleCaptions: () => calls.push("cc"),
      toggleHelp: () => calls.push("help"),
    }

    dispatchShortcutAction("togglePlay", ctx)
    dispatchShortcutAction("seekForward10", ctx)
    dispatchShortcutAction("volumeDown", ctx)
    dispatchShortcutAction("toggleCaptions", ctx)

    expect(calls).toEqual(["play", "seek:10", "vol:-0.1", "cc"])
  })
})

describe("formatTime", () => {
  test("formats mm:ss", () => {
    expect(formatTime(65)).toBe("1:05")
    expect(formatTime(0)).toBe("0:00")
  })
})