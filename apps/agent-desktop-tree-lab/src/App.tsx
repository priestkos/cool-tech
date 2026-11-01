import { useEffect, useRef, useState } from "react"
import { JotterWindow } from "@/components/JotterWindow"
import { JsonEnvelopeViewer } from "@/components/JsonEnvelopeViewer"
import {
  CommandConsole,
  TokenMeterPanel,
} from "@/components/ConsoleAndMeter"
import { TreeOutline } from "@/components/TreeOutline"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useLabState } from "@/hooks/useLabState"
import { stripInternalKeys } from "@/lib/tree-builder"
import { Pause, Play, RotateCcw, StepForward } from "lucide-react"

export default function App() {
  const lab = useLabState()
  const windowRef = useRef<HTMLDivElement>(null)
  const [cmdInput, setCmdInput] = useState(
    "agent-desktop snapshot --app Jotter -i --compact",
  )

  useEffect(() => {
    const el = windowRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect
      if (box) {
        lab.setWindowSize({
          width: Math.round(box.width),
          height: Math.round(box.height),
        })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [lab])

  const displayTree = stripInternalKeys(lab.treeBuilt.tree)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card px-4 py-3">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-lg font-semibold">Agent Desktop Tree Lab</h1>
              <p className="text-xs text-muted-foreground">
                Unofficial demo inspired by Vercel Labs&apos; agent-desktop. Not made by or affiliated with Vercel. Scripted replay in the browser; no real OS control, no AI.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Mock mode: scripted replay, no real OS control</Badge>
              <Badge variant="outline" className="opacity-60">
                Real mode (not exercised)
              </Badge>
            </div>
          </div>
          <p className="mx-auto mt-2 max-w-7xl text-xs text-muted-foreground">
            Upstream:{" "}
            <a
              className="underline"
              href="https://github.com/vercel-labs/agent-desktop"
              rel="noreferrer"
              target="_blank"
            >
              vercel-labs/agent-desktop
            </a>{" "}
            (docs @{" "}
            <a
              className="underline"
              href="https://github.com/vercel-labs/agent-desktop/commit/3c3c8a956bd080497a90ba94a002b07409836e9a"
              rel="noreferrer"
              target="_blank"
            >
              3c3c8a9
            </a>
            ) · Buzz:{" "}
            <a
              className="underline"
              href="https://x.com/ctatedev/status/2116323148706771302"
              rel="noreferrer"
              target="_blank"
            >
              @ctatedev on X
            </a>
          </p>
        </header>

        <main className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Fake desktop — Jotter</CardTitle>
            </CardHeader>
            <CardContent>
              <JotterWindow
                state={lab.appState}
                highlightKey={lab.highlightKey}
                onHighlight={lab.setHighlightKey}
                cursors={lab.cursors}
                windowRef={windowRef}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Accessibility tree</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <ScrollArea className="h-72 rounded border p-2">
                <TreeOutline
                  tree={displayTree}
                  refMap={lab.treeBuilt.refMap}
                  highlightKey={lab.highlightKey}
                  onHighlight={lab.setHighlightKey}
                />
              </ScrollArea>
              <JsonEnvelopeViewer envelope={lab.lastEnvelope} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">agent-desktop command console</CardTitle>
              <Badge variant="secondary" className="w-fit">
                Mock mode: scripted replay, no real OS control
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <Tabs
                value={lab.scenarioKind}
                onValueChange={(v) => lab.switchScenario(v as "main" | "multi")}
              >
                <TabsList>
                  <TabsTrigger value="main">Main scenario</TabsTrigger>
                  <TabsTrigger value="multi">Multi-agent cursors</TabsTrigger>
                </TabsList>
                <TabsContent value="main" className="text-xs text-muted-foreground">
                  Snapshot → New → stale ref → re-snapshot → type → pin → verify
                </TabsContent>
                <TabsContent value="multi" className="text-xs text-muted-foreground">
                  Simulated multi-agent cursors (agent-desktop supports this on macOS and Windows): writer and tidier interleave with their own snapshots.
                </TabsContent>
              </Tabs>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={lab.playing ? "secondary" : "default"}
                  onClick={() => lab.setPlaying(!lab.playing)}
                  disabled={lab.stepIndex >= lab.scenario.length}
                >
                  {lab.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                  {lab.playing ? "Pause" : "Play"}
                </Button>
                <Button size="sm" variant="outline" onClick={lab.stepOnce}>
                  <StepForward className="size-4" />
                  Step
                </Button>
                <Button size="sm" variant="outline" onClick={lab.resetAll}>
                  <RotateCcw className="size-4" />
                  Reset
                </Button>
                <span className="self-center text-xs text-muted-foreground">
                  Step {Math.min(lab.stepIndex, lab.scenario.length)} / {lab.scenario.length}
                </span>
              </div>

              <CommandConsole entries={lab.consoleEntries} />

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="cmd" className="text-xs">
                    Type a command
                  </Label>
                  <Input
                    id="cmd"
                    value={cmdInput}
                    onChange={(e) => setCmdInput(e.target.value)}
                    className="font-mono text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        lab.runUserCommand(cmdInput)
                      }
                    }}
                  />
                </div>
                <Button
                  className="self-end"
                  size="sm"
                  onClick={() => lab.runUserCommand(cmdInput)}
                >
                  Run
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <TokenMeterPanel
                treeTotal={lab.tokenTotals.tree}
                imageTotal={lab.tokenTotals.image}
                ratio={lab.ratio}
                windowWidth={lab.windowSize.width}
                windowHeight={lab.windowSize.height}
                fullscreenEstimate={lab.fullscreenEstimate}
                onToggleFullscreen={lab.setFullscreenEstimate}
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </TooltipProvider>
  )
}
