import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  defaultSortDirection,
} from "@/lib/charts"
import {
  formatCell,
  getMetricSection,
  getModelById,
  modelsForTab,
  polarityForSort,
  rankLabel,
  sortRows,
} from "@/lib/scores"
import type { MetricTab, ModelId } from "@/lib/types"

type SortState = { key: string; direction: "asc" | "desc" } | null

export function ScoreboardPanel({
  tab,
  onSelectModel,
  selectedModelId,
}: {
  tab: MetricTab
  onSelectModel: (id: ModelId) => void
  selectedModelId: ModelId | null
}) {
  const section = getMetricSection(tab)
  const defaultKey = section.columns[0]?.key ?? "mean"
  const [sort, setSort] = useState<SortState>({
    key: defaultKey,
    direction: defaultSortDirection(tab, defaultKey),
  })

  const rows = useMemo(() => {
    const filtered = section.rows.filter((row) => {
      const modelId = String(row.modelId) as ModelId
      return modelsForTab(tab).some((m) => m.id === modelId)
    })
    if (!sort) {
      return filtered
    }
    return sortRows(filtered, sort.key, sort.direction)
  }, [section.rows, sort, tab])

  const polarityHint =
    section.polarity === "higher"
      ? "Higher is better"
      : section.polarity === "lower"
        ? "Lower is better"
        : "Lower % changed · higher acceptance"

  function toggleSort(key: string) {
    setSort((prev) => {
      if (prev?.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        }
      }
      return { key, direction: polarityForSort(tab, key) }
    })
  }

  function SortIcon({ columnKey }: { columnKey: string }) {
    if (sort?.key !== columnKey) {
      return <ArrowUpDown className="size-3 opacity-40" />
    }
    return sort.direction === "asc" ? (
      <ArrowUp className="size-3" />
    ) : (
      <ArrowDown className="size-3" />
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
        <p className="text-muted-foreground text-sm">{section.methodology}</p>
        <p className="text-muted-foreground text-xs">{polarityHint}</p>
      </div>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Model</TableHead>
              <TableHead className="w-24">Rank</TableHead>
              {section.columns.map((col) => (
                <TableHead key={col.key}>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-medium"
                    onClick={() => toggleSort(col.key)}
                  >
                    {col.label}
                    <SortIcon columnKey={col.key} />
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const modelId = String(row.modelId) as ModelId
              const model = getModelById(modelId)
              const isBaseline = Boolean(row.isBaseline)
              const rank = Number(row.rank ?? 0)
              return (
                <TableRow
                  key={modelId}
                  data-state={selectedModelId === modelId ? "selected" : undefined}
                  className="cursor-pointer"
                  onClick={() => onSelectModel(modelId)}
                >
                  <TableCell className="font-medium">
                    {model?.name ?? modelId}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isBaseline ? "secondary" : "outline"}>
                      {rankLabel(rank, isBaseline)}
                    </Badge>
                  </TableCell>
                  {section.columns.map((col) => (
                    <TableCell key={col.key} className="tabular-nums">
                      {formatCell(row[col.key], col.format)}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
