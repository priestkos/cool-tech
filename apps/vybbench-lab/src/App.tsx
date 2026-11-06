import { useCallback, useEffect, useState } from "react"

import { FidelityViewer } from "@/components/fidelity-viewer"
import { MetricBarChartGrid } from "@/components/metric-bar-chart"
import { ModelDetailSheet } from "@/components/model-detail-sheet"
import { ScoreboardPanel } from "@/components/scoreboard-panel"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { chartForTab } from "@/lib/charts"
import { getFixture } from "@/lib/scores"
import type { AppUrlState, MetricTab, ModelId, ScenarioId } from "@/lib/types"
import {
  applyUrlState,
  DEFAULT_URL_STATE,
  parseHash,
  serializeHash,
} from "@/lib/url-state"

function scenarioForTab(tab: MetricTab): ScenarioId {
  if (tab === "font") return "font-harbor"
  if (tab === "color") return "color-gray"
  return "edit-coral"
}

export default function App() {
  const [state, setState] = useState<AppUrlState>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_URL_STATE
    }
    return parseHash(window.location.hash)
  })
  const [drawerOpen, setDrawerOpen] = useState(false)

  const patchState = useCallback((patch: Partial<AppUrlState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch }
      if (patch.tab && !patch.scenarioId) {
        next.scenarioId = scenarioForTab(patch.tab)
      }
      applyUrlState(next)
      return next
    })
  }, [])

  useEffect(() => {
    const onHash = () => setState(parseHash(window.location.hash))
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  function selectModel(id: ModelId) {
    setDrawerOpen(true)
    patchState({ modelId: id })
  }

  const fixture = getFixture()

  return (
    <TooltipProvider>
      <div className="bg-background min-h-svh">
        <header className="border-b">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">VybBench 1.0 fixture</Badge>
              <Badge variant="secondary">{fixture.run} run</Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">VybBench Lab</h1>
            <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
              Unofficial community demo. Not affiliated with, or endorsed by, Coco Labs or Vyb.
              Scores are from the published VybBench 1.0 results (Apache-2.0 code / CC-BY-4.0
              dataset). Viewer images are illustrative mocks.
            </p>
            <p className="text-muted-foreground text-xs">
              VybBench was built by Coco Labs, makers of Vyb. Upstream:{" "}
              <a
                className="text-foreground underline underline-offset-2"
                href="https://github.com/cocolabsai/vybbench"
                target="_blank"
                rel="noreferrer"
              >
                vybbench
              </a>
              {" · "}
              <a
                className="text-foreground underline underline-offset-2"
                href="https://huggingface.co/datasets/cocolabs/vybbench"
                target="_blank"
                rel="noreferrer"
              >
                dataset
              </a>
              {" · "}
              <a
                className="text-foreground underline underline-offset-2"
                href="https://cocolabs.ai/blog/introducing-vybbench"
                target="_blank"
                rel="noreferrer"
              >
                launch post
              </a>
              {" · "}
              <a
                className="text-foreground underline underline-offset-2"
                href="https://x.com/anurahk/status/2118423168612528242"
                target="_blank"
                rel="noreferrer"
              >
                buzz
              </a>
            </p>
            {fixture.footnote && (
              <p className="text-muted-foreground text-xs italic">{fixture.footnote}</p>
            )}
          </div>
        </header>

        <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8">
          <Tabs
            value={state.tab}
            onValueChange={(v) => patchState({ tab: v as MetricTab })}
          >
            <TabsList>
              <TabsTrigger value="font">Font</TabsTrigger>
              <TabsTrigger value="color">Color</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>
            {(["font", "color", "edit"] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="mt-6 space-y-8">
                <div className="grid gap-8 lg:grid-cols-2">
                  <ScoreboardPanel
                    tab={tab}
                    selectedModelId={state.modelId}
                    onSelectModel={selectModel}
                  />
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Bar chart</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MetricBarChartGrid specs={chartForTab(tab)} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <Separator />

          <FidelityViewer
            scenarioId={state.scenarioId}
            onScenarioChange={(scenarioId) => patchState({ scenarioId })}
            diffHeat={state.diffHeat}
            onDiffHeatChange={(diffHeat) => patchState({ diffHeat })}
            highlightModelId={state.modelId}
          />
        </main>

        <footer className="text-muted-foreground border-t px-4 py-6 text-center text-xs">
          Hash state:{" "}
          <code className="bg-muted rounded px-1 py-0.5">{serializeHash(state)}</code>
        </footer>

        <ModelDetailSheet
          modelId={state.modelId}
          open={drawerOpen}
          onOpenChange={(open) => {
            setDrawerOpen(open)
            if (!open) {
              patchState({ modelId: null })
            }
          }}
        />
      </div>
    </TooltipProvider>
  )
}
