import type { ParsedTable } from "./types";

export type ColumnMapping = {
  dateColumn: string;
  areaValueColumns: string[];
  openColumn: string;
  highColumn: string;
  lowColumn: string;
  closeColumn: string;
  funnelStageColumn: string;
  funnelValueColumn: string;
  radarLabelColumn: string;
  radarMetricColumns: string[];
};

const DATE_HINTS = ["date", "time", "day", "timestamp"];
const STAGE_HINTS = ["stage", "step", "label", "name"];
const VALUE_HINTS = ["value", "count", "amount", "total", "volume"];
const OHLC: Record<"open" | "high" | "low" | "close", string[]> = {
  open: ["open"],
  high: ["high"],
  low: ["low"],
  close: ["close"],
};

function findColumn(columns: string[], hints: string[]): string {
  const lower = columns.map((c) => c.toLowerCase());
  for (const hint of hints) {
    const idx = lower.findIndex((c) => c === hint || c.includes(hint));
    if (idx >= 0) return columns[idx];
  }
  return "";
}

function numericColumns(table: ParsedTable): string[] {
  return table.columns.filter((col) => {
    const values = table.rows.map((r) => r[col]?.trim() ?? "");
    if (values.every((v) => v === "")) return false;
    return values.every((v) => v === "" || !Number.isNaN(Number(v)));
  });
}

function parseableDateColumn(table: ParsedTable): string {
  for (const col of table.columns) {
    const sample = table.rows.slice(0, 5).map((r) => r[col]);
    if (sample.length === 0) continue;
    if (sample.every((v) => !Number.isNaN(Date.parse(v)))) {
      return col;
    }
  }
  return findColumn(table.columns, DATE_HINTS);
}

export function detectColumnMapping(table: ParsedTable): ColumnMapping {
  const numeric = numericColumns(table);
  const dateColumn = parseableDateColumn(table) || table.columns[0] || "";
  const openColumn = findColumn(table.columns, OHLC.open);
  const highColumn = findColumn(table.columns, OHLC.high);
  const lowColumn = findColumn(table.columns, OHLC.low);
  const closeColumn = findColumn(table.columns, OHLC.close);
  const funnelStageColumn =
    findColumn(table.columns, STAGE_HINTS) ||
    table.columns.find((c) => c !== dateColumn && !numeric.includes(c)) ||
    "";
  const funnelValueColumn =
    findColumn(table.columns, VALUE_HINTS) ||
    numeric.find((c) => c !== dateColumn) ||
    "";
  const radarLabelColumn =
    table.columns.find((c) => !numeric.includes(c)) || table.columns[0] || "";
  const radarMetricColumns = numeric.filter(
    (c) => c !== dateColumn && c !== radarLabelColumn,
  );
  const areaValueColumns = numeric
    .filter((c) => c !== dateColumn && c !== "volume")
    .slice(0, 2);
  if (areaValueColumns.length === 0 && closeColumn) {
    areaValueColumns.push(closeColumn);
  }

  return {
    dateColumn,
    areaValueColumns,
    openColumn,
    highColumn,
    lowColumn,
    closeColumn,
    funnelStageColumn,
    funnelValueColumn,
    radarLabelColumn,
    radarMetricColumns,
  };
}

export function mergeMapping(
  base: ColumnMapping,
  patch: Partial<ColumnMapping>,
): ColumnMapping {
  return { ...base, ...patch };
}
