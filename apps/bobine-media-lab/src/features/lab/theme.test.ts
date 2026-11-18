import { describe, expect, test } from "bun:test"
import { toggleTheme } from "./theme"

describe("lab theme toggle", () => {
  test("alternates light and dark", () => {
    expect(toggleTheme("light")).toBe("dark")
    expect(toggleTheme("dark")).toBe("light")
  })
})