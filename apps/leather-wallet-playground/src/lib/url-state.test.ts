import { describe, expect, test } from "bun:test"
import { clampConfig, DEFAULT_CONFIG, MAX_CARDS } from "./config"
import {
  configFromSearch,
  parseRawPayload,
  searchFromConfig,
  serializeRawPayload,
} from "./url-state"

describe("URL config round-trip", () => {
  test("defaults when param missing", () => {
    const cfg = configFromSearch("")
    expect(cfg.cards.length).toBe(DEFAULT_CONFIG.cards.length)
    expect(cfg.widthPx).toBe(DEFAULT_CONFIG.widthPx)
  })

  test("round-trips a custom config", () => {
    const custom = clampConfig({
      ...DEFAULT_CONFIG,
      pocketLabel: "Test Pocket",
      widthPx: 320,
      cards: DEFAULT_CONFIG.cards.slice(0, 2),
    })
    const restored = configFromSearch(searchFromConfig(custom))
    expect(restored.pocketLabel).toBe("Test Pocket")
    expect(restored.widthPx).toBe(320)
    expect(restored.cards).toHaveLength(2)
    expect(restored.cards[0]?.title).toBe(DEFAULT_CONFIG.cards[0]?.title)
  })

  test("clamps card count and width", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({
      title: `Card ${i}`,
      description: "x",
      content: "y",
      colorClass: "bg-sky-600 text-white",
    }))
    const parsed = parseRawPayload(
      serializeRawPayload({ pocketLabel: "x", widthPx: 9999, cards: many }),
    )
    expect(parsed.cards.length).toBe(MAX_CARDS)
    expect(parsed.widthPx).toBeLessThanOrEqual(480)
  })

  test("bad token does not crash", () => {
    expect(() => configFromSearch("?w=not-valid!!!")).not.toThrow()
    const cfg = configFromSearch("?w=not-valid!!!")
    expect(cfg.cards.length).toBeGreaterThan(0)
  })
})
