import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlaygroundControls } from "@/features/lab/PlaygroundControls"
import { Swarm, supportsCustomHighlight } from "@/features/swarm/Swarm"
import type { TriggerMode } from "@/features/swarm/types"

function usePrefersReducedMotion() {
  return useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])
}

const DASHBOARD_STATS = [
  { label: "Runs today", value: "128", hint: "Local fixture" },
  { label: "Avg build time", value: "4.2s", hint: "No network" },
  { label: "Agents online", value: "4", hint: "Canvas cursors" },
]

export default function App() {
  const prefersReduced = usePrefersReducedMotion()
  const [motionOverride, setMotionOverride] = useState(true)
  const motionEnabled = !prefersReduced && motionOverride
  const [themeDark, setThemeDark] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [trigger, setTrigger] = useState<TriggerMode>("visible")
  const [showLabels, setShowLabels] = useState(true)
  const [replaySignal, setReplaySignal] = useState(0)
  const [runSignal, setRunSignal] = useState(0)

  const highlightOk = useMemo(() => supportsCustomHighlight(), [])

  return (
    <div
      className={themeDark ? "dark min-h-dvh bg-background text-foreground" : "min-h-dvh bg-background text-foreground"}
      data-motion={motionEnabled ? "on" : "off"}
    >
      <header className="border-b border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Agent Swarm Lab
              </h1>
              <Badge variant="outline">Clean-room demo</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Independent recreation inspired by{" "}
              <a
                href="https://zadescoxp.github.io/agent-swarm-effect/"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                agent-swarm-effect
              </a>{" "}
              (
              <a
                href="https://github.com/zadescoxp/agent-swarm-effect"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                MIT, Zade
              </a>
              ). Upstream is too new to install; behavior is rebuilt locally with canvas
              agents, scan line, and CSS Custom Highlight typing.
            </p>
          </div>
          <p className="text-muted-foreground text-xs sm:max-w-xs sm:text-right">
            Offline · no API keys · system fonts only
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[0.95fr_1.05fr]">
        <PlaygroundControls
          speed={speed}
          onSpeedChange={setSpeed}
          themeDark={themeDark}
          onThemeChange={setThemeDark}
          trigger={trigger}
          onTriggerChange={setTrigger}
          showLabels={showLabels}
          onShowLabelsChange={setShowLabels}
          motionEnabled={motionEnabled}
          onMotionChange={setMotionOverride}
          onReplay={() => setReplaySignal((n) => n + 1)}
          onManualRun={() => setRunSignal((n) => n + 1)}
          highlightSupported={highlightOk}
        />

        <div className="space-y-6 lg:col-span-2">
          <Swarm
            trigger={trigger}
            speed={speed}
            reducedMotion={!motionEnabled}
            showLabels={showLabels}
            replaySignal={replaySignal}
            runSignal={runSignal}
            className="rounded-xl"
          >
            <Card className="swarm-frame-pending border-dashed border-primary/30 shadow-md">
              <CardHeader>
                <CardTitle>Swarm landing frame</CardTitle>
                <CardDescription className="swarm-typable">
                  Fake agents sketch this card, sweep a scan line, then type this line in while
                  it stays hidden via ::highlight(swarm-hidden)—not DOM span splitting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground swarm-typable text-sm">
                  Trigger: {trigger} · Speed: {speed.toFixed(1)}× · Labels{" "}
                  {showLabels ? "on" : "off"}.
                </p>
              </CardContent>
            </Card>
          </Swarm>

          <div className="grid gap-4 sm:grid-cols-3">
            {DASHBOARD_STATS.map((stat, i) => (
              <Swarm
                key={stat.label}
                trigger="visible"
                speed={speed}
                reducedMotion={!motionEnabled}
                showLabels={showLabels}
                replaySignal={replaySignal}
                agentLabels={[`A${i + 1}`, `B${i + 1}`, `C${i + 1}`, `D${i + 1}`]}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>{stat.label}</CardDescription>
                    <CardTitle className="text-2xl">{stat.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground swarm-typable text-xs">{stat.hint}</p>
                  </CardContent>
                </Card>
              </Swarm>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
