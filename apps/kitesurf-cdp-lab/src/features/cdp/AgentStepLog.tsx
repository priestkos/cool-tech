import { Label } from "@/components/ui/label"
import { formatEntry } from "./useCdpLab"
import type { TranscriptEntry } from "@/cdp/types"

type Props = {
  entries: TranscriptEntry[]
  index: number
  maxIndex: number
  onScrub: (index: number) => void
}

export function AgentStepLog({ entries, index, maxIndex, onScrub }: Props) {
  const entry = entries[index]

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor="agent-scrub">
          Step {index + 1} / {maxIndex + 1} · {entry?.atMs ?? 0} ms
        </Label>
        <span className="text-muted-foreground text-[0.65rem]">
          {entry?.direction ?? "—"} · replayable CDP transcript
        </span>
      </div>
      <input
        id="agent-scrub"
        type="range"
        min={0}
        max={maxIndex}
        value={index}
        onChange={(e) => onScrub(Number(e.target.value))}
        className="accent-primary w-full"
        aria-valuemin={0}
        aria-valuemax={maxIndex}
        aria-valuenow={index}
        aria-label="Scrub agent CDP step log"
      />
      <pre className="max-h-52 overflow-auto rounded-md border border-border/60 bg-card p-3 font-mono text-[0.65rem] leading-relaxed">
        {entry ? formatEntry(entry) : "{}"}
      </pre>
    </section>
  )
}