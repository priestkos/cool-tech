import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { GenerationRecord } from "@/lib/generation-types"

type Props = {
  history: GenerationRecord[]
  activeId?: string
  onSelect: (record: GenerationRecord) => void
}

export function GenerationHistoryPanel({ history, activeId, onSelect }: Props) {
  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent generations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Up to five results stay in memory for replay.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent generations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {history.map((item) => (
          <HistoryRow
            key={item.id}
            item={item}
            active={item.id === activeId}
            onSelect={() => onSelect(item)}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function HistoryRow({
  item,
  active,
  onSelect,
}: {
  item: GenerationRecord
  active: boolean
  onSelect: () => void
}) {
  const preview =
    item.text.length > 56 ? `${item.text.slice(0, 56)}…` : item.text
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm ${active ? "border-primary bg-primary/5" : "border-border"}`}
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{preview}</p>
        <p className="text-xs text-muted-foreground">
          {item.language.toUpperCase()} · RTF {item.rtf.toFixed(2)} ·{" "}
          {item.audioSeconds.toFixed(1)} s
        </p>
      </div>
      <Button type="button" size="sm" variant="ghost" onClick={onSelect}>
        Replay
      </Button>
    </div>
  )
}