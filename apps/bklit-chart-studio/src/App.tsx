import { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { ChartGrid } from "@/components/chart-grid";
import { DataPanel } from "@/components/data-panel";
import { MappingPanel } from "@/components/mapping-panel";
import { StudioHeader } from "@/components/studio-header";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useThemeMode } from "@/hooks/use-theme";
import { REPRODUCE_BUILD_SNIPPET } from "@/lib/install-command";
import {
  detectColumnMapping,
  mergeMapping,
  type ColumnMapping,
} from "@/lib/table/mapping";
import { parseDatasetInput } from "@/lib/table/parse";
import { getSample, type SampleId } from "@/lib/table/samples";

function recomputeRadarMetrics(
  table: { columns: string[]; rows: Record<string, string>[] },
  mapping: ColumnMapping,
): ColumnMapping {
  const numeric = table.columns.filter((col) =>
    table.rows.every((row) => {
      const v = row[col]?.trim() ?? "";
      return v === "" || !Number.isNaN(Number(v));
    }),
  );
  return {
    ...mapping,
    radarMetricColumns: numeric.filter(
      (c) => c !== mapping.dateColumn && c !== mapping.radarLabelColumn,
    ),
  };
}

export default function App() {
  const [theme, toggleTheme] = useThemeMode();
  const [activeSample, setActiveSample] = useState<SampleId>("prices");
  const [text, setText] = useState(() => getSample("prices").defaultText);
  const [mapping, setMapping] = useState<ColumnMapping>(() =>
    detectColumnMapping(getSample("prices").table),
  );

  const parsed = useMemo(() => parseDatasetInput(text), [text]);

  useEffect(() => {
    if (parsed.ok) {
      setMapping(recomputeRadarMetrics(parsed.table, detectColumnMapping(parsed.table)));
    }
  }, [parsed.ok, text]);

  function loadSample(id: SampleId) {
    const sample = getSample(id);
    setActiveSample(id);
    setText(sample.defaultText);
    setMapping(recomputeRadarMetrics(sample.table, detectColumnMapping(sample.table)));
  }

  function handleMappingChange(patch: Partial<ColumnMapping>) {
    if (!parsed.ok) return;
    setMapping((prev) =>
      recomputeRadarMetrics(parsed.table, mergeMapping(prev, patch)),
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-svh bg-background text-foreground">
        <StudioHeader theme={theme} onToggleTheme={toggleTheme} />
        <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
          <DataPanel
            text={text}
            parseError={parsed.ok ? null : parsed.error}
            activeSample={activeSample}
            onTextChange={setText}
            onSelectSample={loadSample}
          />
          {parsed.ok ? (
            <>
              <MappingPanel table={parsed.table} mapping={mapping} onChange={handleMappingChange} />
              <ChartGrid table={parsed.table} mapping={mapping} />
            </>
          ) : null}
          <Collapsible className="rounded-lg border bg-muted/30 p-4 text-left">
            <CollapsibleTrigger className="text-sm font-medium underline-offset-4 hover:underline">
              Reproduce this build (pinned registry)
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
                {REPRODUCE_BUILD_SNIPPET}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        </main>
        <Toaster richColors closeButton />
      </div>
    </TooltipProvider>
  );
}
