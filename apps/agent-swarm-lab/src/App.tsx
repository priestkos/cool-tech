import { useMemo, useRef, useState } from "react"
import { Swarm, type SwarmHandle } from "agent-swarm-effect"
import type { SwarmTrigger } from "agent-swarm-effect/vanilla"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlaygroundControls } from "@/features/lab/PlaygroundControls"
import { supportsCustomHighlight } from "@/lib/highlight-capability"

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
  const landingRef = useRef<SwarmHandle>(null)
  const statsRef = useRef<SwarmHandle>(null)

  const [motionOverride, setMotionOverride] = useState(true)
  const motionEnabled = !prefersReduced && motionOverride
  const [themeDark, setThemeDark] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [trigger, setTrigger] = useState<SwarmTrigger>("visible")
  const [showLabels, setShowLabels] = useState(true)
  const highlightOk = useMemo(() => supportsCustomHighlight(), [])

  const swarmTheme = themeDark ? "dark" : "light"
  const respectReducedMotion = !motionEnabled

  const handleReplay = () => {
    landingRef.current?.replay()
    statsRef.current?.replay()
  }

  const handleManualRun = () => {
    landingRef.current?.play()
    statsRef.current?.play()
  }

  return (
    <div
      className={
        themeDark
          ? "dark min-h-dvh bg-background text-foreground"
          : "min-h-dvh bg-background text-foreground"
      }
    >
      <header className="border-b border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Agent Swarm Lab
              </h1>
              <Badge variant="outline">agent-swarm-effect 0.1.2</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Playground for the official{" "}
              <a
                href="https://zadescoxp.github.io/agent-swarm-effect/"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                agent-swarm-effect
              </a>{" "}
              package (
              <a
                href="https://github.com/zadescoxp/agent-swarm-effect"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                MIT, Zade
              </a>
              ). Canvas agents draw each card frame, scan tall blocks, and type text
              in using the CSS Custom Highlight API.
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
          onReplay={handleReplay}
          onManualRun={handleManualRun}
          highlightSupported={highlightOk}
        />

        <div className="space-y-6 lg:col-span-2">
          <Swarm
            ref={landingRef}
            trigger={trigger}
            speed={speed}
            theme={swarmTheme}
            labels={showLabels}
            names={showLabels}
            respectReducedMotion={respectReducedMotion}
            className="rounded-xl"
          >
            <Card
              data-swarm="Swarm landing frame"
              className="border-dashed border-primary/30 shadow-md"
            >
              <CardHeader>
                <CardTitle>Swarm landing frame</CardTitle>
                <CardDescription>
                  Agents build this card: frame drag, scan line, then type this line in
                  while text stays hidden via the library&apos;s CSS highlight ranges—not
                  DOM span splitting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Trigger: {trigger} · Speed: {speed.toFixed(1)}× · Labels{" "}
                  {showLabels ? "on" : "off"}.
                </p>
              </CardContent>
            </Card>
          </Swarm>

          <Swarm
            ref={statsRef}
            trigger="visible"
            speed={speed}
            theme={swarmTheme}
            labels={showLabels}
            names={showLabels}
            respectReducedMotion={respectReducedMotion}
            className="grid gap-4 sm:grid-cols-3"
          >
            {DASHBOARD_STATS.map((stat) => (
              <Card key={stat.label} data-swarm={stat.label}>
                <CardHeader className="pb-2">
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-2xl">{stat.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-xs">{stat.hint}</p>
                </CardContent>
              </Card>
            ))}
          </Swarm>
        </div>
      </main>
    </div>
  )
}