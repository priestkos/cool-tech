import { describe, expect, test } from "bun:test"
import {
  dispatchShortcutAction,
  shouldDispatchShortcut,
  type KeyboardHandlerContext,
} from "./useKeyboardShortcuts"
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
    expect(mapKeyToAction("?", "Slash", { typingInField: true })).toBeNull()
  })

  test("maps the remaining transport keys", () => {
    expect(mapKeyToAction("ArrowRight", "ArrowRight", {})).toBe("seekForwardSmall")
    expect(mapKeyToAction("ArrowDown", "ArrowDown", {})).toBe("volumeDown")
    expect(mapKeyToAction("m", "KeyM", {})).toBe("toggleMute")
    expect(mapKeyToAction("F", "KeyF", {})).toBe("toggleFullscreen")
    expect(mapKeyToAction("c", "KeyC", {})).toBe("toggleCaptions")
    expect(mapKeyToAction("?", "Slash", {})).toBe("showHelp")
    expect(mapKeyToAction("/", "Slash", {})).toBe("showHelp")
    expect(mapKeyToAction("/", "KeySlash", {})).toBeNull()
    expect(mapKeyToAction("Spacebar", "Space", {})).toBe("togglePlay")
    expect(mapKeyToAction("Unidentified", "Space", {})).toBe("togglePlay")
    expect(mapKeyToAction("x", "KeyX", {})).toBeNull()
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

  test("uses the small-seek and volume deltas", () => {
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

    dispatchShortcutAction("seekBack10", ctx)
    dispatchShortcutAction("seekBackSmall", ctx)
    dispatchShortcutAction("seekForwardSmall", ctx)
    dispatchShortcutAction("volumeUp", ctx)
    dispatchShortcutAction("toggleMute", ctx)
    dispatchShortcutAction("toggleFullscreen", ctx)
    dispatchShortcutAction("showHelp", ctx)

    expect(calls).toEqual(["seek:-10", "seek:-5", "seek:5", "vol:0.1", "mute", "fs", "help"])
  })
})

describe("shouldDispatchShortcut", () => {
  test("ignores keys when focus is outside the player", () => {
    const inside = {} as Node
    const outside = {} as Node
    const root = {
      contains: (node: Node) => node === inside,
    }

    expect(shouldDispatchShortcut(root, inside)).toBe(true)
    expect(shouldDispatchShortcut(root, outside)).toBe(false)
    expect(shouldDispatchShortcut(root, root as unknown as Node)).toBe(true)
    expect(shouldDispatchShortcut(null, outside)).toBe(true)
    expect(shouldDispatchShortcut(undefined, null)).toBe(true)
  })
})

describe("formatTime", () => {
  test("formats mm:ss", () => {
    expect(formatTime(65)).toBe("1:05")
    expect(formatTime(0)).toBe("0:00")
    expect(formatTime(3599.9)).toBe("59:59")
    expect(formatTime(3600)).toBe("60:00")
  })

  test("rejects non-timelines", () => {
    expect(formatTime(-4)).toBe("0:00")
    expect(formatTime(Number.NaN)).toBe("0:00")
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe("0:00")
  })
})