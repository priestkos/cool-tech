import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnMapping } from "@/lib/table/mapping";
import type { ParsedTable } from "@/lib/table/types";

function ColumnSelect({
  label,
  value,
  columns,
  onChange,
  allowEmpty,
}: {
  label: string;
  value: string;
  columns: string[];
  onChange: (value: string) => void;
  allowEmpty?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose column" />
        </SelectTrigger>
        <SelectContent>
          {allowEmpty ? <SelectItem value="">—</SelectItem> : null}
          {columns.map((col) => (
            <SelectItem key={col} value={col}>
              {col}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function MappingPanel({
  table,
  mapping,
  onChange,
}: {
  table: ParsedTable;
  mapping: ColumnMapping;
  onChange: (patch: Partial<ColumnMapping>) => void;
}) {
  const numericColumns = useMemo(
    () =>
      table.columns.filter((col) =>
        table.rows.every((row) => {
          const v = row[col]?.trim() ?? "";
          return v === "" || !Number.isNaN(Number(v));
        }),
      ),
    [table],
  );

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Column mapping</h2>
        <Badge variant="secondary">{table.rows.length} rows</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ColumnSelect
          label="Date / X axis"
          value={mapping.dateColumn}
          columns={table.columns}
          onChange={(dateColumn) => onChange({ dateColumn })}
        />
        <ColumnSelect
          label="Area value (primary)"
          value={mapping.areaValueColumns[0] ?? ""}
          columns={numericColumns}
          onChange={(col) =>
            onChange({
              areaValueColumns: [col, mapping.areaValueColumns[1]].filter(Boolean),
            })
          }
        />
        <ColumnSelect
          label="Area value (secondary)"
          value={mapping.areaValueColumns[1] ?? ""}
          columns={numericColumns}
          allowEmpty
          onChange={(col) =>
            onChange({
              areaValueColumns: [mapping.areaValueColumns[0], col].filter(Boolean),
            })
          }
        />
        <ColumnSelect
          label="Open"
          value={mapping.openColumn}
          columns={numericColumns}
          onChange={(openColumn) => onChange({ openColumn })}
        />
        <ColumnSelect
          label="High"
          value={mapping.highColumn}
          columns={numericColumns}
          onChange={(highColumn) => onChange({ highColumn })}
        />
        <ColumnSelect
          label="Low"
          value={mapping.lowColumn}
          columns={numericColumns}
          onChange={(lowColumn) => onChange({ lowColumn })}
        />
        <ColumnSelect
          label="Close"
          value={mapping.closeColumn}
          columns={numericColumns}
          onChange={(closeColumn) => onChange({ closeColumn })}
        />
        <ColumnSelect
          label="Funnel stage"
          value={mapping.funnelStageColumn}
          columns={table.columns}
          onChange={(funnelStageColumn) => onChange({ funnelStageColumn })}
        />
        <ColumnSelect
          label="Funnel value"
          value={mapping.funnelValueColumn}
          columns={numericColumns}
          onChange={(funnelValueColumn) => onChange({ funnelValueColumn })}
        />
        <ColumnSelect
          label="Radar series label"
          value={mapping.radarLabelColumn}
          columns={table.columns}
          onChange={(radarLabelColumn) => onChange({ radarLabelColumn })}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Radar metrics use every numeric column except the date and series label columns (
        {mapping.radarMetricColumns.join(", ") || "none yet"}).
      </p>
    </div>
  );
}
