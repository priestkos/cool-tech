import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { formatCell, getModelById, modelSummaries } from "@/lib/scores"
import type { ModelId } from "@/lib/types"

const DISCLOSURE =
  "Unofficial community demo — not affiliated with Coco Labs or Vyb."

export function ModelDetailSheet({
  modelId,
  open,
  onOpenChange,
}: {
  modelId: ModelId | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!modelId) {
    return null
  }
  const model = getModelById(modelId)
  const summaries = modelSummaries(modelId)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{model?.name ?? modelId}</SheetTitle>
          <SheetDescription>
            {model?.vendor}
            {model?.note ? ` · ${model.note}` : ""}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4 text-sm">
          {summaries.font && (
            <div>
              <p className="font-medium">Font fidelity</p>
              <p className="text-muted-foreground tabular-nums">
                Mean IoU {formatCell(summaries.font.mean, "decimal")} · Worst 5%{" "}
                {formatCell(summaries.font.worst5, "decimal")}
              </p>
            </div>
          )}
          {summaries.color && (
            <div>
              <p className="font-medium">Color fidelity</p>
              <p className="text-muted-foreground tabular-nums">
                Mean Δ {formatCell(summaries.color.mean, "decimal1")} · Worst 5%{" "}
                {formatCell(summaries.color.worst5, "integer")}
              </p>
            </div>
          )}
          {summaries.edit && (
            <div>
              <p className="font-medium">Edit fidelity</p>
              <p className="text-muted-foreground tabular-nums">
                Pixels {formatCell(summaries.edit.pixelsMean, "percent")} · Worst 5%{" "}
                {formatCell(summaries.edit.pixelsWorst5, "percent")} · Acceptance{" "}
                {formatCell(summaries.edit.acceptance, "percent")}
              </p>
            </div>
          )}
          {!summaries.color && !summaries.edit && model?.fontOnly && (
            <p className="text-muted-foreground">
              Noise-floor measurement row (font tab only).
            </p>
          )}
          <Separator />
          <p className="text-muted-foreground text-xs leading-relaxed">{DISCLOSURE}</p>
          <p className="text-muted-foreground text-xs">
            Scores from published VybBench 1.0 (October 2026). Viewer images are illustrative mocks.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
