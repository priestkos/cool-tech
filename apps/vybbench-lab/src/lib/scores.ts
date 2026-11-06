import rawFixture from "@/fixtures/vybbench-1.0-scores.json"
import type {
  MetricSection,
  MetricTab,
  ModelId,
  ModelMeta,
  VybbenchFixture,
} from "@/lib/types"

const fixture = rawFixture as VybbenchFixture

export function getFixture(): VybbenchFixture {
  return fixture
}

export function parseFixture(data: unknown): VybbenchFixture {
  if (!data || typeof data !== "object") {
    throw new Error("Fixture must be an object")
  }
  const f = data as VybbenchFixture
  if (!Array.isArray(f.models) || f.models.length === 0) {
    throw new Error("Fixture models required")
  }
  for (const tab of ["font", "color", "edit"] as const) {
    const section = f[tab]
    if (!section?.rows?.length) {
      throw new Error(`Fixture ${tab} rows required`)
    }
  }
  return f
}

export function getModelById(id: ModelId): ModelMeta | undefined {
  return fixture.models.find((m) => m.id === id)
}

export function getMetricSection(tab: MetricTab): MetricSection {
  return fixture[tab]
}

export function modelsForTab(tab: MetricTab): ModelMeta[] {
  if (tab === "font") {
    return fixture.models
  }
  return fixture.models.filter((m) => !m.fontOnly)
}

export type SortDirection = "asc" | "desc"

export function polarityForSort(
  tab: MetricTab,
  columnKey: string,
): SortDirection {
  if (tab === "font") {
    return "desc"
  }
  if (tab === "color") {
    return "asc"
  }
  if (columnKey === "acceptance") {
    return "desc"
  }
  return "asc"
}

export function compareMetricValues(
  a: number,
  b: number,
  direction: SortDirection,
): number {
  if (a === b) {
    return 0
  }
  return direction === "asc" ? a - b : b - a
}

export function sortRows<T extends Record<string, unknown>>(
  rows: T[],
  columnKey: string,
  direction: SortDirection,
): T[] {
  return [...rows].sort((left, right) => {
    const a = Number(left[columnKey])
    const b = Number(right[columnKey])
    if (Number.isNaN(a) || Number.isNaN(b)) {
      return 0
    }
    return compareMetricValues(a, b, direction)
  })
}

export function rankLabel(rank: number, isBaseline?: boolean): string {
  if (isBaseline) {
    return "Baseline"
  }
  if (rank <= 0) {
    return "—"
  }
  return `#${rank}`
}

export function formatCell(
  value: unknown,
  format: MetricSection["columns"][number]["format"],
): string {
  if (value === undefined || value === null) {
    return "—"
  }
  const n = Number(value)
  switch (format) {
    case "decimal":
      return n.toFixed(2)
    case "decimal1":
      return n.toFixed(1)
    case "integer":
      return String(Math.round(n))
    case "percent":
      return `${n.toFixed(1)}%`
    default:
      return String(value)
  }
}

export function modelSummaries(modelId: ModelId): {
  font?: Record<string, number>
  color?: Record<string, number>
  edit?: Record<string, number>
} {
  const out: ReturnType<typeof modelSummaries> = {}
  const fontRow = fixture.font.rows.find((r) => r.modelId === modelId)
  if (fontRow) {
    out.font = { mean: Number(fontRow.mean), worst5: Number(fontRow.worst5) }
  }
  const colorRow = fixture.color.rows.find((r) => r.modelId === modelId)
  if (colorRow) {
    out.color = { mean: Number(colorRow.mean), worst5: Number(colorRow.worst5) }
  }
  const editRow = fixture.edit.rows.find((r) => r.modelId === modelId)
  if (editRow) {
    out.edit = {
      pixelsMean: Number(editRow.pixelsMean),
      pixelsWorst5: Number(editRow.pixelsWorst5),
      acceptance: Number(editRow.acceptance),
    }
  }
  return out
}
