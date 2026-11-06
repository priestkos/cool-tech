import {
  getFixture,
  getMetricSection,
  polarityForSort,
  type SortDirection,
} from "@/lib/scores"
import type { MetricTab } from "@/lib/types"

export interface BarSeries {
  id: string
  label: string
  value: number
  display: string
  isBaseline?: boolean
}

export interface BarChartSpec {
  title: string
  hint: string
  max: number
  series: BarSeries[]
}

function chartMax(values: number[], pad = 1.08): number {
  const max = Math.max(...values, 0.001)
  return max * pad
}

export function fontMeanChart(): BarChartSpec {
  const section = getMetricSection("font")
  const series = section.rows.map((row) => ({
    id: String(row.modelId),
    label: getFixture().models.find((m) => m.id === row.modelId)?.name ?? "",
    value: Number(row.mean),
    display: Number(row.mean).toFixed(2),
    isBaseline: Boolean(row.isBaseline),
  }))
  return {
    title: "Font mean IoU",
    hint: "Higher is better",
    max: chartMax(series.map((s) => s.value), 1.02),
    series,
  }
}

export function colorMeanChart(): BarChartSpec {
  const section = getMetricSection("color")
  const series = section.rows.map((row) => ({
    id: String(row.modelId),
    label: getFixture().models.find((m) => m.id === row.modelId)?.name ?? "",
    value: Number(row.mean),
    display: Number(row.mean).toFixed(1),
  }))
  return {
    title: "Color mean channel error",
    hint: "Lower is better (0–255)",
    max: chartMax(series.map((s) => s.value), 1.15),
    series,
  }
}

export function editCharts(): {
  pixels: BarChartSpec
  acceptance: BarChartSpec
} {
  const section = getMetricSection("edit")
  const pixels = section.rows.map((row) => ({
    id: String(row.modelId),
    label: getFixture().models.find((m) => m.id === row.modelId)?.name ?? "",
    value: Number(row.pixelsMean),
    display: `${Number(row.pixelsMean).toFixed(1)}%`,
  }))
  const acceptance = section.rows.map((row) => ({
    id: String(row.modelId),
    label: getFixture().models.find((m) => m.id === row.modelId)?.name ?? "",
    value: Number(row.acceptance),
    display: `${Number(row.acceptance).toFixed(1)}%`,
  }))
  return {
    pixels: {
      title: "Edit — pixels changed (mean)",
      hint: "Lower is better",
      max: 100,
      series: pixels,
    },
    acceptance: {
      title: "Edit — LLM acceptance",
      hint: "Higher is better",
      max: 100,
      series: acceptance,
    },
  }
}

export function chartForTab(tab: MetricTab): BarChartSpec[] {
  switch (tab) {
    case "font":
      return [fontMeanChart()]
    case "color":
      return [colorMeanChart()]
    case "edit": {
      const { pixels, acceptance } = editCharts()
      return [pixels, acceptance]
    }
    default: {
      const _never: never = tab
      return _never
    }
  }
}

export function defaultSortDirection(
  tab: MetricTab,
  columnKey: string,
): SortDirection {
  return polarityForSort(tab, columnKey)
}
