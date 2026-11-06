import { getFixture } from "@/lib/scores"
import {
  getAfterImage,
  getBeforeImage,
  getDiffHeatOverlay,
  MOCK_CAPTION,
  viewerModelIds,
} from "@/lib/mock-assets"
import type { ModelId, ScenarioId } from "@/lib/types"
import { getModelById } from "@/lib/scores"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function FidelityViewer({
  scenarioId,
  onScenarioChange,
  diffHeat,
  onDiffHeatChange,
  highlightModelId,
}: {
  scenarioId: ScenarioId
  onScenarioChange: (id: ScenarioId) => void
  diffHeat: boolean
  onDiffHeatChange: (on: boolean) => void
  highlightModelId: ModelId | null
}) {
  const scenarios = getFixture().scenarios
  const scenario = scenarios.find((s) => s.id === scenarioId)
  const before = getBeforeImage(scenarioId)
  const showDiff = diffHeat && scenarioId === "edit-coral"

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Fidelity viewer</h2>
          <p className="text-muted-foreground max-w-xl text-sm">
            Side-by-side ground truth and per-model mocks. {MOCK_CAPTION}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium">Scenario</label>
            <Select
              value={scenarioId}
              onValueChange={(v) => v && onScenarioChange(v as ScenarioId)}
            >
              <SelectTrigger className="w-[min(100vw-2rem,20rem)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {scenarioId === "edit-coral" && (
            <div className="flex items-center gap-2">
              <Switch
                id="diff-heat"
                checked={diffHeat}
                onCheckedChange={onDiffHeatChange}
              />
              <label htmlFor="diff-heat" className="text-sm">
                Diff heat overlay
              </label>
            </div>
          )}
        </div>
      </div>
      {scenario && (
        <p className="text-muted-foreground text-xs">{scenario.description}</p>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_2fr]">
        <figure className="space-y-2 rounded-lg border p-3">
          <figcaption className="text-sm font-medium">Ground truth / before</figcaption>
          <img
            src={before}
            alt="Ground truth mock"
            className="mx-auto max-h-40 w-auto rounded-md border bg-white"
          />
          <p className="text-muted-foreground text-center text-[11px]">{MOCK_CAPTION}</p>
        </figure>
        <div className="grid gap-3 sm:grid-cols-2">
          {viewerModelIds().map((modelId) => {
            const after = getAfterImage(scenarioId, modelId)
            const model = getModelById(modelId)
            const highlighted = highlightModelId === modelId
            return (
              <figure
                key={modelId}
                className={`relative space-y-2 rounded-lg border p-3 ${highlighted ? "ring-primary ring-2" : ""}`}
              >
                <figcaption className="flex items-center justify-between gap-2 text-sm font-medium">
                  <span>{model?.name ?? modelId}</span>
                  {highlighted && <Badge variant="secondary">Selected</Badge>}
                </figcaption>
                <div className="relative mx-auto w-fit">
                  {after && (
                    <img
                      src={after}
                      alt={`${model?.name} mock after`}
                      className="max-h-40 w-auto rounded-md border bg-white"
                    />
                  )}
                  {showDiff && (
                    <img
                      src={getDiffHeatOverlay()}
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute inset-0 max-h-40 w-full object-contain mix-blend-multiply"
                    />
                  )}
                </div>
                <p className="text-muted-foreground text-center text-[11px]">{MOCK_CAPTION}</p>
              </figure>
            )
          })}
        </div>
      </div>
    </div>
  )
}
