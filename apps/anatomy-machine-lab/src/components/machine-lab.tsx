import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { EffectsOverlay } from "@/components/effects-overlay"
import {
  IsometricDiagram,
  partScreenAnchor,
} from "@/components/isometric-diagram"
import type { MachineDefinition, MachineId } from "@/lib/types"
import {
  advancePlayback,
  cycleSpeed,
  resetPlayback,
  scrubPlayback,
  togglePlay,
  type PlaybackState,
} from "@/lib/timeline"
import { Pause, Play, RotateCcw, SunMoon } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

type Props = {
  machines: MachineDefinition[]
  machineId: MachineId
  onMachineChange: (id: MachineId) => void
  playback: PlaybackState
  onPlaybackChange: (state: PlaybackState) => void
  onToggleTheme: () => void
  effectsEnabled: boolean
  onEffectsEnabled: (v: boolean) => void
  reducedMotion: boolean
}

export function MachineLab({
  machines,
  machineId,
  onMachineChange,
  playback,
  onPlaybackChange,
  onToggleTheme,
  effectsEnabled,
  onEffectsEnabled,
  reducedMotion,
}: Props) {
  const machine = machines.find((m) => m.id === machineId) ?? machines[0]
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [focusId, setFocusId] = useState<string | null>(null)
  const activeId = focusId ?? hoverId
  const playbackRef = useRef(playback)
  useEffect(() => {
    playbackRef.current = playback
  }, [playback])

  useEffect(() => {
    if (!playback.playing) return
    let last = performance.now()
    let raf = 0
    const loop = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      onPlaybackChange(advancePlayback(playbackRef.current, dt))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [playback.playing, playback.speed, onPlaybackChange])

  const poses = useMemo(
    () => machine.partPoses(playback.simTime),
    [machine, playback.simTime],
  )
  const readouts = useMemo(
    () => machine.readouts(playback.simTime),
    [machine, playback.simTime],
  )
  const hints = useMemo(
    () => machine.effectHints?.(playback.simTime) ?? [],
    [machine, playback.simTime],
  )

  const activePart = machine.parts.find((p) => p.id === activeId)
  const calloutPose = activeId ? poses.find((p) => p.partId === activeId) : null
  const callout =
    activePart && calloutPose
      ? {
          ...activePart,
          ...partScreenAnchor(calloutPose),
        }
      : null

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>{machine.title}</CardTitle>
            <p className="text-muted-foreground text-sm">{machine.subtitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="effects" className="text-xs">
              Effects
            </Label>
            <Switch
              id="effects"
              checked={effectsEnabled && !reducedMotion}
              disabled={reducedMotion}
              onCheckedChange={onEffectsEnabled}
            />
          </div>
        </CardHeader>
        <CardContent className="relative">
          <IsometricDiagram
            poses={poses}
            highlightedId={activeId}
            onHover={setHoverId}
            onFocusPart={setFocusId}
            callout={callout}
          />
          <EffectsOverlay
            enabled={effectsEnabled}
            hints={hints}
            reducedMotion={reducedMotion}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Machine</Label>
              <Select
                value={machineId}
                onValueChange={(v: MachineId | null) => {
                  if (v) onMachineChange(v)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {machines.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => onPlaybackChange(togglePlay(playback))}
              >
                {playback.playing ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
                {playback.playing ? "Pause" : "Play"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onPlaybackChange(cycleSpeed(playback))}
              >
                {playback.speed}x
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onPlaybackChange(resetPlayback(machine.cycleSeconds))
                }
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={onToggleTheme}>
                <SunMoon className="size-4" />
                Theme
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{playback.simTime.toFixed(1)}s</span>
                <span>{machine.cycleSeconds}s</span>
              </div>
              <Slider
                value={[playback.simTime]}
                min={0}
                max={machine.cycleSeconds}
                step={0.05}
                onValueChange={(value) => {
                  const v = Array.isArray(value) ? (value[0] ?? 0) : value
                  onPlaybackChange(
                    scrubPlayback(
                      { ...playback, maxTime: machine.cycleSeconds },
                      v,
                    ),
                  )
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Live readouts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {readouts.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span className="text-muted-foreground">{r.label}</span>
                <Badge variant="secondary">{r.value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Parts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {machine.parts.map((part) => (
              <button
                key={part.id}
                type="button"
                className={`w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  activeId === part.id
                    ? "border-primary bg-primary/10"
                    : "hover:bg-muted/60"
                }`}
                onMouseEnter={() => setHoverId(part.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setFocusId(part.id)}
                onBlur={() => setFocusId(null)}
              >
                <div className="font-medium">{part.label}</div>
                <div className="text-muted-foreground text-xs">{part.description}</div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
