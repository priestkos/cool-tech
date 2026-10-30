import { tableFromObjects } from "./parse";
import type { ParsedTable } from "./types";

export type SampleId = "prices" | "funnel" | "products";

export type SampleDataset = {
  id: SampleId;
  label: string;
  description: string;
  table: ParsedTable;
  defaultText: string;
};

const priceRows = [
  { date: "2025-10-01", open: 142, high: 148, low: 139, close: 146, volume: 12000 },
  { date: "2025-10-02", open: 146, high: 151, low: 144, close: 149, volume: 13200 },
  { date: "2025-10-03", open: 149, high: 153, low: 147, close: 150, volume: 11800 },
  { date: "2025-10-04", open: 150, high: 155, low: 148, close: 152, volume: 14100 },
  { date: "2025-10-05", open: 152, high: 158, low: 150, close: 156, volume: 15200 },
  { date: "2025-10-06", open: 156, high: 160, low: 153, close: 154, volume: 13800 },
  { date: "2025-10-07", open: 154, high: 159, low: 151, close: 158, volume: 14500 },
  { date: "2025-10-08", open: 158, high: 163, low: 155, close: 161, volume: 16000 },
];

const funnelRows = [
  { stage: "Visitors", value: 12400 },
  { stage: "Signups", value: 6800 },
  { stage: "Activated", value: 3200 },
  { stage: "Paid", value: 1500 },
  { stage: "Retained", value: 620 },
];

const productRows = [
  { product: "Alpha", speed: 82, reliability: 91, cost: 68, support: 74 },
  { product: "Beta", speed: 71, reliability: 88, cost: 79, support: 85 },
  { product: "Gamma", speed: 90, reliability: 76, cost: 62, support: 70 },
];

function toCsv(columns: string[], rows: Record<string, string | number>[]): string {
  const header = columns.join(",");
  const body = rows
    .map((row) => columns.map((c) => String(row[c] ?? "")).join(","))
    .join("\n");
  return `${header}\n${body}`;
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: "prices",
    label: "Daily prices",
    description: "OHLC series for candlestick and area charts",
    table: tableFromObjects(
      ["date", "open", "high", "low", "close", "volume"],
      priceRows,
    ),
    defaultText: toCsv(
      ["date", "open", "high", "low", "close", "volume"],
      priceRows,
    ),
  },
  {
    id: "funnel",
    label: "Signup funnel",
    description: "Stage counts for the funnel chart",
    table: tableFromObjects(["stage", "value"], funnelRows),
    defaultText: toCsv(["stage", "value"], funnelRows),
  },
  {
    id: "products",
    label: "Product comparison",
    description: "Multi-metric rows for radar and area",
    table: tableFromObjects(
      ["product", "speed", "reliability", "cost", "support"],
      productRows,
    ),
    defaultText: toCsv(
      ["product", "speed", "reliability", "cost", "support"],
      productRows,
    ),
  },
];

export function getSample(id: SampleId): SampleDataset {
  const sample = SAMPLE_DATASETS.find((s) => s.id === id);
  if (!sample) {
    throw new Error(`Unknown sample: ${id}`);
  }
  return sample;
}
