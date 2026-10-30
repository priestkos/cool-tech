import type { OHLCDataPoint } from "@/components/charts/candlestick-chart";
import type { FunnelStage } from "@/components/charts/funnel-chart";
import type { RadarData, RadarMetric } from "@/components/charts/radar-context";
import type { ColumnMapping } from "./mapping";
import type { ParsedTable } from "./types";

export type MapperSuccess<T> = { ok: true; data: T };
export type MapperFailure = { ok: false; missing: string[] };
export type MapperResult<T> = MapperSuccess<T> | MapperFailure;

function parseDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isNaN(n) ? null : n;
}

function requireColumns(mapping: ColumnMapping, keys: (keyof ColumnMapping)[]): string[] {
  const missing: string[] = [];
  for (const key of keys) {
    const value = mapping[key];
    if (typeof value === "string" && !value) {
      missing.push(String(key));
    }
    if (Array.isArray(value) && value.length === 0) {
      missing.push(String(key));
    }
  }
  return missing;
}

export function mapAreaSeries(
  table: ParsedTable,
  mapping: ColumnMapping,
): MapperResult<Array<Record<string, Date | number>>> {
  const missing = requireColumns(mapping, ["dateColumn", "areaValueColumns"]);
  if (missing.length > 0 || mapping.areaValueColumns.length === 0) {
    return {
      ok: false,
      missing: ["date", ...mapping.areaValueColumns.map((c) => c || "value")].filter(Boolean),
    };
  }
  if (!mapping.dateColumn) {
    return { ok: false, missing: ["date"] };
  }
  const data: Array<Record<string, Date | number>> = [];
  for (const row of table.rows) {
    const date = parseDate(row[mapping.dateColumn] ?? "");
    if (!date) continue;
    const point: Record<string, Date | number> = { date };
    let valid = true;
    for (const col of mapping.areaValueColumns) {
      const num = parseNumber(row[col] ?? "");
      if (num === null) {
        valid = false;
        break;
      }
      point[col] = num;
    }
    if (valid) data.push(point);
  }
  if (data.length === 0) {
    return { ok: false, missing: mapping.areaValueColumns };
  }
  return { ok: true, data };
}

export function mapOhlcSeries(
  table: ParsedTable,
  mapping: ColumnMapping,
): MapperResult<OHLCDataPoint[]> {
  const cols = [
    mapping.openColumn,
    mapping.highColumn,
    mapping.lowColumn,
    mapping.closeColumn,
    mapping.dateColumn,
  ];
  if (cols.some((c) => !c)) {
    return {
      ok: false,
      missing: ["date", "open", "high", "low", "close"].filter((_, i) => !cols[i]),
    };
  }
  const data: OHLCDataPoint[] = [];
  for (const row of table.rows) {
    const date = parseDate(row[mapping.dateColumn] ?? "");
    const open = parseNumber(row[mapping.openColumn] ?? "");
    const high = parseNumber(row[mapping.highColumn] ?? "");
    const low = parseNumber(row[mapping.lowColumn] ?? "");
    const close = parseNumber(row[mapping.closeColumn] ?? "");
    if (date && open !== null && high !== null && low !== null && close !== null) {
      data.push({ date, open, high, low, close });
    }
  }
  if (data.length === 0) {
    return { ok: false, missing: ["open", "high", "low", "close", "date"] };
  }
  return { ok: true, data };
}

export function mapFunnelStages(
  table: ParsedTable,
  mapping: ColumnMapping,
): MapperResult<FunnelStage[]> {
  if (!mapping.funnelStageColumn || !mapping.funnelValueColumn) {
    return { ok: false, missing: ["stage", "value"] };
  }
  const data: FunnelStage[] = [];
  for (const row of table.rows) {
    const label = row[mapping.funnelStageColumn]?.trim();
    const value = parseNumber(row[mapping.funnelValueColumn] ?? "");
    if (label && value !== null) {
      data.push({ label, value });
    }
  }
  if (data.length === 0) {
    return { ok: false, missing: [mapping.funnelStageColumn, mapping.funnelValueColumn] };
  }
  return { ok: true, data };
}

const RADAR_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function mapRadarChart(
  table: ParsedTable,
  mapping: ColumnMapping,
): MapperResult<{ data: RadarData[]; metrics: RadarMetric[] }> {
  if (!mapping.radarLabelColumn || mapping.radarMetricColumns.length === 0) {
    return { ok: false, missing: ["label", ...mapping.radarMetricColumns] };
  }
  const metrics: RadarMetric[] = mapping.radarMetricColumns.map((key) => ({
    key,
    label: key,
  }));
  const rawValues: number[][] = [];
  const labels: string[] = [];
  for (const row of table.rows) {
    const label = row[mapping.radarLabelColumn]?.trim();
    if (!label) continue;
    const nums: number[] = [];
    let ok = true;
    for (const col of mapping.radarMetricColumns) {
      const n = parseNumber(row[col] ?? "");
      if (n === null) {
        ok = false;
        break;
      }
      nums.push(n);
    }
    if (ok) {
      labels.push(label);
      rawValues.push(nums);
    }
  }
  if (labels.length === 0) {
    return { ok: false, missing: mapping.radarMetricColumns };
  }
  const maxByMetric = metrics.map((_, idx) =>
    Math.max(...rawValues.map((row) => row[idx] ?? 0), 1),
  );
  const data: RadarData[] = labels.map((label, rowIdx) => ({
    label,
    color: RADAR_COLORS[rowIdx % RADAR_COLORS.length],
    values: Object.fromEntries(
      metrics.map((m, colIdx) => [
        m.key,
        Math.round(((rawValues[rowIdx]?.[colIdx] ?? 0) / maxByMetric[colIdx]) * 100),
      ]),
    ),
  }));
  return { ok: true, data: { data, metrics } };
}

export function missingLabel(result: MapperFailure): string {
  return result.missing.join(", ");
}
