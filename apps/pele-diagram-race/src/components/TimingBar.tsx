import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  buildChunkSizes,
  formatBytes,
  publishedPackageSizes,
} from "@/lib/bundleSizes"
import { formatMs, speedupRatio } from "@/lib/timing"

type TimingBarProps = {
  peleLastMs: number | null
  mermaidLastMs: number | null
  raceBusy: boolean
  raceIterations: number
  peleRaceAvgMs: number | null
  mermaidRaceAvgMs: number | null
  onRace: () => void
}

export function TimingBar({
  peleLastMs,
  mermaidLastMs,
  raceBusy,
  raceIterations,
  peleRaceAvgMs,
  mermaidRaceAvgMs,
  onRace,
}: TimingBarProps) {
  const lastSpeedup =
    peleLastMs && mermaidLastMs
      ? speedupRatio(mermaidLastMs, peleLastMs)
      : null
  const raceSpeedup =
    peleRaceAvgMs && mermaidRaceAvgMs
      ? speedupRatio(mermaidRaceAvgMs, peleRaceAvgMs)
      : null

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Pele last: {formatMs(peleLastMs ?? NaN)} ms</Badge>
        <Badge variant="secondary">
          mermaid.js last: {formatMs(mermaidLastMs ?? NaN)} ms
        </Badge>
        {lastSpeedup ? (
          <Badge>
            Last speedup: {lastSpeedup.toFixed(1)}× (mermaid → Pele)
          </Badge>
        ) : null}
        <Button size="sm" disabled={raceBusy} onClick={onRace}>
          {raceBusy ? "Racing…" : `Race ×${raceIterations}`}
        </Button>
      </div>
      {peleRaceAvgMs !== null && mermaidRaceAvgMs !== null ? (
        <p className="text-sm text-muted-foreground">
          Avg over {raceIterations}: Pele {formatMs(peleRaceAvgMs)} ms · mermaid{" "}
          {formatMs(mermaidRaceAvgMs)} ms
          {raceSpeedup ? ` · ${raceSpeedup.toFixed(1)}× faster` : null}
        </p>
      ) : null}
      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <div>
          <p className="font-medium text-foreground">Vite chunks (prod build)</p>
          <p>
            Pele: {formatBytes(buildChunkSizes.pele.bytes)} —{" "}
            {buildChunkSizes.pele.label}
          </p>
          <p>
            mermaid: {formatBytes(buildChunkSizes.mermaid.bytes)} —{" "}
            {buildChunkSizes.mermaid.label}
          </p>
        </div>
        <div>
          <p className="font-medium text-foreground">Published package (min entry)</p>
          <p>
            Pele: {formatBytes(publishedPackageSizes.pele.bytes)} —{" "}
            {publishedPackageSizes.pele.label}
          </p>
          <p>
            mermaid: {formatBytes(publishedPackageSizes.mermaid.bytes)} —{" "}
            {publishedPackageSizes.mermaid.label}
          </p>
        </div>
      </div>
    </div>
  )
}
