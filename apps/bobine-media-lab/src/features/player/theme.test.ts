import { describe, expect, test } from "bun:test"
import { applyTheme, resolveInitialTheme, toggleTheme } from "./theme"

const THEME_KEY = "bobine-media-lab-theme"

function fakeRoot() {
  let darkOn = false
  const root = {
    classList: {
      toggle: (_cls: string, on?: boolean) => {
        darkOn = Boolean(on)
        return darkOn
      },
    },
    dataset: {} as DOMStringMap,
    isDark: () => darkOn,
  }
  return root
}

function withWindow<T>(windowValue: unknown, run: () => T): T {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "window")
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    writable: true,
    value: windowValue,
  })
  try {
    return run()
  } finally {
    if (descriptor) Object.defineProperty(globalThis, "window", descriptor)
    else delete (globalThis as { window?: unknown }).window
  }
}

function themeWindow(options: {
  stored?: string
  prefersDark?: boolean
  store?: Record<string, string>
}) {
  const store = options.store ?? {}
  if (options.stored !== undefined) store[THEME_KEY] = options.stored
  return {
    localStorage: {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = value
      },
    },
    matchMedia: (query: string) => ({
      matches: query === "(prefers-color-scheme: dark)" && Boolean(options.prefersDark),
      media: query,
    }),
  }
}

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

  test("applyTheme clears dark and stores the choice", () => {
    const store: Record<string, string> = {}
    const root = fakeRoot()
    withWindow(themeWindow({ store }), () => {
      applyTheme("dark", root as unknown as HTMLElement)
      applyTheme("light", root as unknown as HTMLElement)
    })
    expect(root.isDark()).toBe(false)
    expect(root.dataset.theme).toBe("light")
    expect(store[THEME_KEY]).toBe("light")
  })

  test("resolveInitialTheme prefers a saved value over the OS", () => {
    expect(withWindow(undefined, () => resolveInitialTheme())).toBe("light")
    expect(
      withWindow(themeWindow({ stored: "dark", prefersDark: false }), () => resolveInitialTheme())
    ).toBe("dark")
    expect(
      withWindow(themeWindow({ stored: "sepia", prefersDark: true }), () => resolveInitialTheme())
    ).toBe("dark")
    expect(withWindow(themeWindow({ prefersDark: false }), () => resolveInitialTheme())).toBe("light")
  })
})