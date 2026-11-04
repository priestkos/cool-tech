import { describe, expect, test } from "bun:test"

import { settingsFieldRules } from "./settings-form"

describe("settings form validation rules", () => {
  test("display name requires minimum length", () => {
    const rule = settingsFieldRules.displayName
    expect(rule.required).toBeTruthy()
    expect(rule.minLength).toEqual({ value: 2, message: "Use at least 2 characters." })
  })

  test("volume bounded 0-100", () => {
    expect(settingsFieldRules.volume.min).toEqual({
      value: 0,
      message: "Volume cannot go below 0.",
    })
    expect(settingsFieldRules.volume.max).toEqual({
      value: 100,
      message: "Volume cannot exceed 100.",
    })
  })
})
