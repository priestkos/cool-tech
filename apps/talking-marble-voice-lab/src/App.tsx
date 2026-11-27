import { useCallback, useMemo, useState } from "react"
import { TalkingMarble } from "talking-marble"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { WebComponentMarble } from "@/components/WebComponentMarble"
import { useMicrophoneStream, useMockOscillator } from "@/hooks/useMockAudio"
import {
  BUILTIN_EMOTIONS,
  BUILTIN_STATES,
  DEFAULT_LAB_CONFIG,
  PALETTE_NAMES,
  accessibleNameForMarble,
  marbleViewerProps,
  type AudioMode,
  type LabOrbState,
  type MarbleLabConfig,
} from "@/lib/talking-marble-lab"
import type { BuiltInEmotion } from "talking-marble"

function StateButton({
  name,
  active,
  onPick,
}: {
  name: string
  active: boolean
  onPick: () => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      className="focus-visible:ring-2"
      aria-pressed={active}
      onClick={onPick}
    >
      {name}
    </Button>
  )
}

export default function App() {
  const [config, setConfig] = useState<MarbleLabConfig>(DEFAULT_LAB_CONFIG)

  const mockAudio = useMockOscillator(config.audioMode === "mock")
  const { stream: micStream, error: micError } = useMicrophoneStream(config.audioMode === "mic")

  const audioSource = config.audioMode === "mock" ? mockAudio : config.audioMode === "mic" ? micStream : null

  const viewerProps = useMemo(
    () => marbleViewerProps(config, audioSource),
    [config, audioSource],
  )

  const accessibleName = useMemo(() => accessibleNameForMarble(config), [config])

  const setState = useCallback((state: LabOrbState) => {
    setConfig((c) => ({ ...c, state }))
  }, [])

  const setEmotion = useCallback((emotion: BuiltInEmotion | null) => {
    setConfig((c) => ({ ...c, emotion }))
  }, [])

  const onLevelChange = useCallback((value: number) => {
    setConfig((c) => ({
      ...c,
      level: value,
      audioMode: c.audioMode === "off" ? "level" : c.audioMode,
      state: value > 0.02 && (c.state === "idle" || c.state === "listening") ? "speaking" : c.state,
    }))
  }, [])

  const onAudioMode = useCallback((mode: AudioMode) => {
    setConfig((c) => ({
      ...c,
      audioMode: mode,
      state: mode !== "off" && c.state === "idle" ? "listening" : c.state,
    }))
  }, [])

  return (
    <div className="min-h-dvh">
      <header className="border-b bg-card/60 px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Talking Marble Voice Lab</h1>
        <p className="text-muted-foreground mt-1 max-w-3xl text-sm">
          Offline lab for the real <code className="text-xs">talking-marble@0.1.0</code> package — React
          component and Web Component, same controls, no voice SDKs.
        </p>
      </header>

      <div className="grid gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:px-6">
        <section aria-labelledby="viewers-heading" className="space-y-4">
          <h2 id="viewers-heading" className="sr-only">
            Marble viewers
          </h2>
          <p className="text-center text-sm font-medium">Accessible name: {accessibleName}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">React — TalkingMarble</CardTitle>
                <CardDescription>npm default export</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <TalkingMarble
                  {...viewerProps}
                  aria-label={viewerProps.ariaLabel}
                  style={{ width: viewerProps.size, height: viewerProps.size }}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Web Component — &lt;talking-marble&gt;</CardTitle>
                <CardDescription>talking-marble/element</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <WebComponentMarble {...viewerProps} />
              </CardContent>
            </Card>
          </div>
        </section>

        <ScrollArea className="h-[calc(100dvh-8rem)] pr-3 lg:h-auto lg:max-h-[calc(100dvh-7rem)]">
          <div className="space-y-5 pb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">State</CardTitle>
                <CardDescription>Built-in agent states plus custom preset state labGlow</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {[...BUILTIN_STATES, "labGlow" as const].map((state) => (
                  <StateButton key={state} name={state} active={config.state === state} onPick={() => setState(state)} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Emotion</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <StateButton name="none" active={config.emotion === null} onPick={() => setEmotion(null)} />
                {BUILTIN_EMOTIONS.map((emotion) => (
                  <StateButton
                    key={emotion}
                    name={emotion}
                    active={config.emotion === emotion}
                    onPick={() => setEmotion(emotion)}
                  />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Palette</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {PALETTE_NAMES.map((name) => (
                    <Button
                      key={name}
                      type="button"
                      size="sm"
                      variant={config.paletteMode === "named" && config.paletteName === name ? "default" : "outline"}
                      onClick={() => setConfig((c) => ({ ...c, paletteMode: "named", paletteName: name }))}
                    >
                      {name}
                    </Button>
                  ))}
                </div>
                <Separator />
                <p className="text-muted-foreground text-xs">Custom colours (ground, then three pigments)</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {config.customColors.map((hex, i) => (
                    <div key={i} className="space-y-1">
                      <Label htmlFor={`color-${i}`}>Pigment {i === 0 ? "ground" : i}</Label>
                      <Input
                        id={`color-${i}`}
                        type="color"
                        value={hex}
                        className="h-10 w-full cursor-pointer"
                        onChange={(e) =>
                          setConfig((c) => {
                            const customColors = [...c.customColors] as typeof c.customColors
                            customColors[i] = e.target.value
                            return { ...c, paletteMode: "custom", customColors }
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audio reactivity</CardTitle>
                <CardDescription>
                  Only listening, speaking, and reactive presets respond. Level auto-switches to speaking when raised
                  from idle.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["level", "Level slider"],
                      ["mock", "Mock oscillator"],
                      ["mic", "Live microphone"],
                      ["off", "Off"],
                    ] as const
                  ).map(([mode, label]) => (
                    <Button
                      key={mode}
                      type="button"
                      size="sm"
                      variant={config.audioMode === mode ? "default" : "outline"}
                      onClick={() => onAudioMode(mode)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                {config.audioMode === "level" && (
                  <div className="space-y-2">
                    <Label htmlFor="level-slider">Level ({config.level.toFixed(2)})</Label>
                    <Slider
                      id="level-slider"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[config.level]}
                      onValueChange={(v) => onLevelChange(Array.isArray(v) ? (v[0] ?? 0) : v)}
                    />
                  </div>
                )}
                {config.audioMode === "mic" && micError && (
                  <p className="text-destructive text-sm" role="alert">
                    Mic unavailable: {micError}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Look &amp; accessibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="size-slider">Size ({config.size}px)</Label>
                  <Slider
                    id="size-slider"
                    min={72}
                    max={220}
                    step={4}
                    value={[config.size]}
                    onValueChange={(v) => {
                      const n = Array.isArray(v) ? (v[0] ?? config.size) : v
                      setConfig((c) => ({ ...c, size: n }))
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={config.halo === false ? "default" : "outline"}
                    onClick={() => setConfig((c) => ({ ...c, halo: false }))}
                  >
                    Halo off
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={config.halo === true ? "default" : "outline"}
                    onClick={() => setConfig((c) => ({ ...c, halo: true }))}
                  >
                    Halo on
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="halo-slider">Halo strength (0–1.5)</Label>
                  <Slider
                    id="halo-slider"
                    min={0}
                    max={1.5}
                    step={0.05}
                    value={[typeof config.halo === "number" ? config.halo : 1]}
                    onValueChange={(v) => {
                      const n = Array.isArray(v) ? (v[0] ?? 1) : v
                      setConfig((c) => ({ ...c, halo: n }))
                    }}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="paused">Paused</Label>
                  <Switch
                    id="paused"
                    checked={config.paused}
                    onCheckedChange={(paused) => setConfig((c) => ({ ...c, paused }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="decorative">Decorative (aria-hidden)</Label>
                  <Switch
                    id="decorative"
                    checked={config.decorative}
                    onCheckedChange={(decorative) => setConfig((c) => ({ ...c, decorative }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="agent-label">Label</Label>
                  <Input
                    id="agent-label"
                    value={config.label}
                    onChange={(e) => setConfig((c) => ({ ...c, label: e.target.value }))}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="use-aria">Override with aria-label</Label>
                  <Switch
                    id="use-aria"
                    checked={config.useAriaLabel}
                    onCheckedChange={(useAriaLabel) => setConfig((c) => ({ ...c, useAriaLabel }))}
                  />
                </div>
                {config.useAriaLabel && (
                  <Input
                    aria-label="Custom aria-label"
                    value={config.ariaLabel}
                    onChange={(e) => setConfig((c) => ({ ...c, ariaLabel: e.target.value }))}
                    placeholder="Custom accessible name"
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">About</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-2 text-sm">
                <p>
                  Independent demo using{" "}
                  <a className="text-primary underline" href="https://github.com/imjustinliao/Talking-Marble">
                    Talking Marble
                  </a>{" "}
                  (MIT, Justin Liao). Not affiliated with the official project.
                </p>
                <p>
                  Docs:{" "}
                  <a className="text-primary underline" href="https://talking-marble.vercel.app/docs/">
                    talking-marble.vercel.app/docs
                  </a>{" "}
                  · Launch:{" "}
                  <a className="text-primary underline" href="https://x.com/imjustinliao/status/2125359641312014787">
                    X post
                  </a>
                </p>
                <Badge variant="outline">No network at runtime</Badge>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}