import { describe, expect, test } from "bun:test"
import {
  isLabStateMessage,
  isPreferencesPatchMessage,
  LAB_CHANNEL,
} from "../astryx-frame/protocol.ts"
import { DEFAULT_PREFERENCES } from "./types.ts"

describe("iframe lab protocol", () => {
  test("accepts valid lab-state message", () => {
    expect(
      isLabStateMessage({
        channel: LAB_CHANNEL,
        type: "lab-state",
        fixture: "settings",
        colorMode: "light",
        preferences: DEFAULT_PREFERENCES,
      }),
    ).toBe(true)
  })

  test("rejects wrong channel", () => {
    expect(
      isLabStateMessage({
        channel: "other",
        type: "lab-state",
        fixture: "settings",
        colorMode: "light",
        preferences: DEFAULT_PREFERENCES,
      }),
    ).toBe(false)
  })

  test("accepts preferences patch", () => {
    expect(
      isPreferencesPatchMessage({
        channel: LAB_CHANNEL,
        type: "preferences-patch",
        patch: { notifications: false },
      }),
    ).toBe(true)
  })
})
