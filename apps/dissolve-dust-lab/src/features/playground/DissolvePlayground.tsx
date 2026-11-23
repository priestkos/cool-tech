import { useCallback, useRef, useState } from "react"
import { play } from "@/components/dissolve/engine"
import { capture } from "@/components/dissolve/kit"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type PlaygroundControls = {
  grain: number
  duration: number
  direction: "in" | "out"
}

type Props = {
  controls: PlaygroundControls
  onChange: (next: Partial<PlaygroundControls>) => void
}

export function DissolvePlayground({ controls, onChange }: Props) {
  const targetRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)
  const [lastPreset, setLastPreset] = useState<string | null>(null)

  const runDissolve = useCallback(async () => {
    const node = targetRef.current
    if (!node || busy) return
    setBusy(true)
    setLastPreset(`dust · ${controls.direction} · grain ${controls.grain}px · ${controls.duration}ms`)
    try {
      const shot = await capture(node)
      const handle = play({
        ...shot,
        preset: "dust",
        grain: controls.grain,
        duration: controls.duration,
        direction: controls.direction,
      })
      await handle.done
    } finally {
      setBusy(false)
    }
  }, [busy, controls.direction, controls.duration, controls.grain])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="font-heading text-lg">Engine playground</CardTitle>
          <Badge variant="outline">registry/web/engine.ts</Badge>
        </div>
        <CardDescription>
          Sliders map to real <code className="text-xs">play()</code> options — grain in px (2–10) and
          duration in ms (400–4000), same as the official site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          ref={targetRef}
          className="bg-card text-card-foreground border-border/80 mx-auto max-w-sm rounded-2xl border p-6 shadow-sm"
          aria-label="Dissolve target card"
        >
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Snapshot target
          </p>
          <p className="mt-2 text-lg font-semibold">Dissolve any card</p>
          <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
            This box is captured with <code className="text-xs">capture()</code> from kit.ts, then
            handed to the pinned grain engine.
          </p>
        </div>

        <div className="grid gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="grain-slider">Grain size</Label>
              <span className="text-muted-foreground text-xs tabular-nums">{controls.grain}px</span>
            </div>
            <Slider
              id="grain-slider"
              min={2}
              max={10}
              step={0.5}
              value={[controls.grain]}
              onValueChange={(v) => {
                const n = Array.isArray(v) ? v[0] : v
                if (typeof n === "number") onChange({ grain: n })
              }}
              aria-label="Grain size in pixels"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="duration-slider">Speed (duration)</Label>
              <span className="text-muted-foreground text-xs tabular-nums">{controls.duration}ms</span>
            </div>
            <Slider
              id="duration-slider"
              min={400}
              max={4000}
              step={50}
              value={[controls.duration]}
              onValueChange={(v) => {
                const n = Array.isArray(v) ? v[0] : v
                if (typeof n === "number") onChange({ duration: n })
              }}
              aria-label="Dissolve duration in milliseconds"
            />
          </div>
          <div className="space-y-2">
            <Label>Direction</Label>
            <Tabs
              value={controls.direction}
              onValueChange={(v) => onChange({ direction: v === "in" ? "in" : "out" })}
            >
              <TabsList className="grid w-full max-w-xs grid-cols-2">
                <TabsTrigger value="out">out (dust away)</TabsTrigger>
                <TabsTrigger value="in">in (gather)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <Button type="button" onClick={() => void runDissolve()} disabled={busy} className="w-full sm:w-auto">
          {busy ? "Playing…" : "Dissolve this card"}
        </Button>
        {lastPreset ? (
          <p className="text-muted-foreground text-xs" role="status">
            Last call: <code>{lastPreset}</code>
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}