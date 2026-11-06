import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EXTRACTION_STAGES, type ExtractionState, stageLabel } from "@/lib/extraction"

type Props = {
  state: ExtractionState
  onRun: () => void
  onCancel: () => void
  tokensVisible: boolean
}

export function ExtractionPanel({ state, onRun, onCancel, tokensVisible }: Props) {
  const current = stageLabel(state.stageIndex)

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-medium">Mock extraction</h2>
          <p className="text-xs text-muted-foreground">
            Staged progress only — results load from bundled fixtures.
          </p>
        </div>
        <div className="flex gap-2">
          {state.phase === "running" ? (
            <Button variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button size="sm" onClick={onRun} disabled={state.phase === "running"}>
            {state.phase === "running" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Running…
              </>
            ) : (
              "Run extraction"
            )}
          </Button>
        </div>
      </div>
      <ol className="grid gap-2 sm:grid-cols-5">
        {EXTRACTION_STAGES.map((stage, index) => {
          const done =
            state.phase === "done" ||
            (state.phase === "running" && index < state.stageIndex) ||
            (state.phase === "running" && index === state.stageIndex)
          const active = state.phase === "running" && index === state.stageIndex
          return (
            <li
              key={stage}
              className="flex items-center gap-2 rounded-lg border px-2 py-1.5 text-xs capitalize"
            >
              <Badge variant={done ? "default" : "outline"} className="shrink-0">
                {index + 1}
              </Badge>
              <span className={active ? "font-medium" : "text-muted-foreground"}>{stage}</span>
            </li>
          )
        })}
      </ol>
      {tokensVisible ? (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          Fixture token tree loaded{current ? ` (last stage: ${current})` : ""}.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Run extraction to reveal the token tree.</p>
      )}
    </div>
  )
}
