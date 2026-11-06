import { Badge } from "@/components/ui/badge"
import type { ContrastResult } from "@/lib/contrast"
import { Switch } from "@/components/ui/switch"

type Props = {
  results: ContrastResult[]
  highlightFailing: boolean
  onHighlightChange: (value: boolean) => void
}

export function ContrastPanel({ results, highlightFailing, onHighlightChange }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-medium">WCAG contrast</h2>
          <p className="text-xs text-muted-foreground">Client-side relative luminance · AA thresholds</p>
        </div>
        <label className="flex items-center gap-2 text-xs">
          Highlight failing pair in preview
          <Switch checked={highlightFailing} onCheckedChange={onHighlightChange} />
        </label>
      </div>
      <ul className="space-y-2">
        {results.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="size-4 rounded border"
                style={{ background: row.background }}
                aria-hidden
              />
              <span
                className="size-4 rounded border"
                style={{ background: row.foreground }}
                aria-hidden
              />
              <span>{row.label}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="tabular-nums">{row.ratio.toFixed(2)}:1</span>
              <Badge variant={row.aaNormal ? "secondary" : "destructive"}>
                AA {row.aaNormal ? "pass" : "fail"}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
