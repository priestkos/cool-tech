import { describe, expect, test } from "bun:test";
import { detectColumnMapping } from "./mapping";
import {
  mapAreaSeries,
  mapFunnelStages,
  mapOhlcSeries,
  mapRadarChart,
} from "./mappers";
import { parseDatasetInput, tableFromObjects } from "./parse";
import { getSample } from "./samples";

describe("parseDatasetInput", () => {
  test("parses CSV with header", () => {
    const result = parseDatasetInput("a,b\n1,2\n3,4");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.table.columns).toEqual(["a", "b"]);
      expect(result.table.rows).toHaveLength(2);
    }
  });

  test("handles quoted CSV fields", () => {
    const result = parseDatasetInput('name,value\n"Hello, world",10');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.table.rows[0]?.name).toBe("Hello, world");
    }
  });

  test("parses JSON array", () => {
    const result = parseDatasetInput('[{"x":1,"y":2}]');
    expect(result.ok).toBe(true);
  });

  test("returns readable error for bad JSON", () => {
    const result = parseDatasetInput("[not json");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.length).toBeGreaterThan(5);
    }
  });

  test("returns readable error for column mismatch", () => {
    const result = parseDatasetInput("a,b\n1");
    expect(result.ok).toBe(false);
  });
});

describe("mappers", () => {
  test("maps price sample to OHLC and area", () => {
    const table = getSample("prices").table;
    const mapping = detectColumnMapping(table);
    const area = mapAreaSeries(table, mapping);
    const ohlc = mapOhlcSeries(table, mapping);
    expect(area.ok).toBe(true);
    expect(ohlc.ok).toBe(true);
  });

  test("maps funnel sample", () => {
    const table = getSample("funnel").table;
    const mapping = detectColumnMapping(table);
    const funnel = mapFunnelStages(table, mapping);
    expect(funnel.ok).toBe(true);
    if (funnel.ok) {
      expect(funnel.data.length).toBeGreaterThan(2);
    }
  });

  test("maps product sample to radar", () => {
    const table = getSample("products").table;
    const mapping = detectColumnMapping(table);
    const radar = mapRadarChart(table, mapping);
    expect(radar.ok).toBe(true);
  });

  test("reports missing columns for incomplete mapping", () => {
    const table = tableFromObjects(["only"], [{ only: "x" }]);
    const mapping = detectColumnMapping(table);
    const ohlc = mapOhlcSeries(table, mapping);
    expect(ohlc.ok).toBe(false);
  });
});
