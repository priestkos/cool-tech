import { describe, expect, test } from "bun:test"
import { applyTheme, toggleTheme } from "./theme"

describe("theme tokens", () => {
  test("toggleTheme flips", () => {
    expect(toggleTheme("light")).toBe("dark")
    expect(toggleTheme("dark")).toBe("light")
  })

  test("applyTheme sets dark class", () => {
    let darkOn = false
    const root = {
      classList: {
        toggle: (_cls: string, on?: boolean) => {
          darkOn = Boolean(on)
          return darkOn
        },
      },
      dataset: {} as DOMStringMap,
    } as HTMLElement
    applyTheme("dark", root)
    expect(darkOn).toBe(true)
    expect(root.dataset.theme).toBe("dark")
  })
})