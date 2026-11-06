import { describe, expect, test } from "bun:test"
import fixture from "@/fixtures/vybbench-1.0-scores.json"
import {
  colorMeanChart,
  editCharts,
  fontMeanChart,
} from "@/lib/charts"
import {
  compareMetricValues,
  parseFixture,
  sortRows,
} from "@/lib/scores"
import {
  DEFAULT_URL_STATE,
  parseHash,
  serializeHash,
} from "@/lib/url-state"

describe("parseFixture", () => {
  test("accepts bundled fixture", () => {
    const parsed = parseFixture(fixture)
    expect(parsed.models.length).toBeGreaterThan(0)
    expect(parsed.font.rows.length).toBe(5)
  })

  test("rejects empty payload", () => {
    expect(() => parseFixture(null)).toThrow()
  })
})

describe("ranking helpers", () => {
  test("higher-is-better sort", () => {
    const rows = [{ mean: 0.5 }, { mean: 0.9 }, { mean: 0.9 }]
    const sorted = sortRows(rows, "mean", "desc")
    expect(sorted[0]?.mean).toBe(0.9)
    expect(compareMetricValues(0.9, 0.9, "desc")).toBe(0)
  })

  test("lower-is-better sort", () => {
    const rows = [{ mean: 5.7 }, { mean: 0 }, { mean: 3.9 }]
    const sorted = sortRows(rows, "mean", "asc")
    expect(sorted[0]?.mean).toBe(0)
  })
})

describe("url state", () => {
  test("round-trip", () => {
    const state = {
      ...DEFAULT_URL_STATE,
      tab: "edit" as const,
      modelId: "muse" as const,
      scenarioId: "edit-coral" as const,
      diffHeat: true,
    }
    const hash = serializeHash(state)
    const parsed = parseHash(hash)
    expect(parsed.tab).toBe("edit")
    expect(parsed.modelId).toBe("muse")
    expect(parsed.scenarioId).toBe("edit-coral")
    expect(parsed.diffHeat).toBe(true)
  })

  test("coerces bad input", () => {
    const parsed = parseHash("#tab=nope&model=bad&scenario=???&diff=yes")
    expect(parsed.tab).toBe("font")
    expect(parsed.modelId).toBe(null)
    expect(parsed.scenarioId).toBe("font-harbor")
    expect(parsed.diffHeat).toBe(false)
  })
})

describe("chart builders", () => {
  test("font bars match fixture order values", () => {
    const chart = fontMeanChart()
    const vyb = chart.series.find((s) => s.id === "vyb-1.0")
    expect(vyb?.value).toBe(0.9)
  })

  test("edit charts deterministic", () => {
    const { pixels, acceptance } = editCharts()
    expect(pixels.series.length).toBe(4)
    expect(acceptance.series.find((s) => s.id === "vyb-1.0")?.value).toBe(99.2)
  })

  test("color chart max scales above top value", () => {
    const chart = colorMeanChart()
    expect(chart.max).toBeGreaterThan(27.2)
  })
})
