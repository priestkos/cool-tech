"use client";

import {
  Area,
  AreaChart,
} from "@/components/charts/area-chart";
import { CandlestickChart } from "@/components/charts/candlestick-chart";
import { Candlestick } from "@/components/charts/candlestick";
import { FunnelChart } from "@/components/charts/funnel-chart";
import { Grid } from "@/components/charts/grid";
import { RadarChart } from "@/components/charts/radar-chart";
import { RadarArea } from "@/components/charts/radar-area";
import { RadarAxis } from "@/components/charts/radar-axis";
import { RadarGrid } from "@/components/charts/radar-grid";
import { RadarLabels } from "@/components/charts/radar-labels";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { ChartStudioCard } from "@/components/chart-studio-card";
import type { ColumnMapping } from "@/lib/table/mapping";
import {
  mapAreaSeries,
  mapFunnelStages,
  mapOhlcSeries,
  mapRadarChart,
  missingLabel,
} from "@/lib/table/mappers";
import type { ParsedTable } from "@/lib/table/types";

export function ChartGrid({
  table,
  mapping,
}: {
  table: ParsedTable;
  mapping: ColumnMapping;
}) {
  const areaResult = mapAreaSeries(table, mapping);
  const ohlcResult = mapOhlcSeries(table, mapping);
  const funnelResult = mapFunnelStages(table, mapping);
  const radarResult = mapRadarChart(table, mapping);

  const primaryAreaKey = mapping.areaValueColumns[0];
  const secondaryAreaKey = mapping.areaValueColumns[1];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartStudioCard
        title="Area chart"
        description="Time series with gradient fills and tooltip"
        slug="area-chart"
        emptyMessage={areaResult.ok ? undefined : missingLabel(areaResult)}
      >
        {areaResult.ok && primaryAreaKey ? (
          <AreaChart data={areaResult.data} aspectRatio="2 / 1" style={{ height: "100%" }}>
            <Grid horizontal />
            <Area
              dataKey={primaryAreaKey}
              fill="var(--chart-line-primary)"
              fillOpacity={0.35}
              fadeEdges
            />
            {secondaryAreaKey ? (
              <Area
                dataKey={secondaryAreaKey}
                fill="var(--chart-line-secondary)"
                fillOpacity={0.25}
                fadeEdges
              />
            ) : null}
            <XAxis />
            <ChartTooltip />
          </AreaChart>
        ) : null}
      </ChartStudioCard>

      <ChartStudioCard
        title="Candlestick chart"
        description="OHLC candles with semantic up/down colors"
        slug="candlestick-chart"
        emptyMessage={ohlcResult.ok ? undefined : missingLabel(ohlcResult)}
      >
        {ohlcResult.ok ? (
          <CandlestickChart data={ohlcResult.data} style={{ height: "100%" }}>
            <Grid horizontal />
            <Candlestick fadedOpacity={0.25} />
            <ChartTooltip />
            <XAxis />
          </CandlestickChart>
        ) : null}
      </ChartStudioCard>

      <ChartStudioCard
        title="Funnel chart"
        description="Animated pipeline stages"
        slug="funnel-chart"
        emptyMessage={funnelResult.ok ? undefined : missingLabel(funnelResult)}
      >
        {funnelResult.ok ? (
          <FunnelChart data={funnelResult.data} color="var(--chart-1)" layers={3} />
        ) : null}
      </ChartStudioCard>

      <ChartStudioCard
        title="Radar chart"
        description="Multi-series comparison on shared metrics"
        slug="radar-chart"
        emptyMessage={radarResult.ok ? undefined : missingLabel(radarResult)}
      >
        {radarResult.ok ? (
          <div className="h-full w-full">
            <RadarChart data={radarResult.data.data} metrics={radarResult.data.metrics}>
            <RadarGrid />
            <RadarAxis />
            <RadarLabels />
            {radarResult.data.data.map((item, index) => (
              <RadarArea key={item.label} index={index} />
            ))}
            </RadarChart>
          </div>
        ) : null}
      </ChartStudioCard>
    </div>
  );
}
