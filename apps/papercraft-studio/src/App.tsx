import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { usePapercraftApi, useWebGl2Supported } from "@/hooks/usePapercraftApi"
import { PALETTE_NAMES, type PaletteName } from "@/papercraft/palette-names"
import { buildTemplateUrl, type PapercraftMode } from "@/papercraft/types"

const RISE_SECONDS = 1.25

function downloadCanvasPng(canvas: HTMLCanvasElement, filename: string) {
  const url = canvas.toDataURL("image/png")
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
}

export default function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const webgl2 = useWebGl2Supported()

  const [mode, setMode] = useState<PapercraftMode>(() =>
    webgl2 === false ? "2d" : "3d",
  )
  const [palette, setPalette] = useState<PaletteName>("storybook-autumn")
  const [tiltShift, setTiltShift] = useState(true)
  const [soundOn, setSoundOn] = useState(true)
  const [scrubSec, setScrubSec] = useState(0)
  const [scrubbing, setScrubbing] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)

  const templateSrc = useMemo(
    () => buildTemplateUrl(mode, palette, tiltShift),
    [mode, palette, tiltShift],
  )
  const { ready, loadError, getApi } = usePapercraftApi(iframeRef, templateSrc)

  useEffect(() => {
    if (webgl2 === false && mode === "3d") setMode("2d")
  }, [webgl2, mode])

  useEffect(() => {
    if (!ready) return
    const api = getApi()
    api?.sound?.setMuted(!soundOn)
  }, [ready, soundOn, getApi, templateSrc])

  useEffect(() => {
    if (!ready || mode !== "3d") return
    const post = getApi()?.post
    if (post) post.o.maxBlur = tiltShift ? 18 : 0
  }, [ready, mode, tiltShift, getApi, templateSrc])

  const runRisePreview = useCallback(
    (sec: number) => {
      const api = getApi()
      if (!api) return
      api.restart()
      if (sec > 0) api.step(sec)
    },
    [getApi],
  )

  useEffect(() => {
    if (!scrubbing || !ready) return
    runRisePreview(scrubSec)
  }, [scrubSec, scrubbing, ready, runRisePreview])

  const onFoldFlat = () => {
    const api = getApi()
    api?.restart()
    setScrubSec(0)
  }

  const onPlayRise = () => {
    const api = getApi()
    if (!api) return
    api.restart()
    api.resume()
    setScrubSec(0)
    setScrubbing(false)
  }

  const onToggleFold = () => {
    getApi()?.toggle()
  }

  const onExportPng = () => {
    const doc = iframeRef.current?.contentDocument
    const canvas = doc?.querySelector("canvas")
    if (!canvas || canvas.tagName !== "CANVAS") return
    downloadCanvasPng(canvas as HTMLCanvasElement, `papercraft-${mode}-${palette}.png`)
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight">Papercraft Studio</h1>
              <Badge variant="outline">xikhar/papercraft @ 57c4c93</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Offline studio chrome around the official pop-up 3D and 2D countryside templates — fold choreography,
              palette switcher, tilt-shift, paper sound, and PNG export. Not affiliated with the upstream author.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setAboutOpen((v) => !v)}>
            {aboutOpen ? "Hide credits" : "About / MIT"}
          </Button>
        </div>
      </header>

      {aboutOpen ? (
        <div className="border-b border-border bg-muted/40 px-4 py-3 text-sm">
          <p className="mx-auto max-w-6xl leading-relaxed">
            Papercraft © 2026 Shikhar (MIT). Vendored from{" "}
            <a
              className="underline"
              href="https://github.com/xikhar/papercraft/commit/57c4c93a1f3b2743066b6ed41094d1bcbb69c3b5"
              target="_blank"
              rel="noreferrer"
            >
              commit 57c4c93
            </a>
            . Launch post:{" "}
            <a
              className="underline"
              href="https://x.com/xikhar/status/2124565795003105494"
              target="_blank"
              rel="noreferrer"
            >
              @xikhar
            </a>
            . Countryside world is the bundled worked example. Audio unlocks on first pointer / key in the template.
            WebGL2 required for 3D lens (PaperPost).
          </p>
        </div>
      ) : null}

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="overflow-hidden py-0">
          <div className="relative aspect-[16/10] w-full bg-[#c9b27e]">
            {webgl2 === false && mode === "3d" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/90 p-6 text-center text-sm">
                WebGL2 is unavailable. Switch to 2D pop-up mode to run the real Canvas 2D template.
              </div>
            ) : null}
            <iframe
              key={templateSrc}
              ref={iframeRef}
              title="Papercraft countryside template"
              src={templateSrc}
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay"
            />
            {loadError ? (
              <p className="absolute bottom-2 left-2 rounded bg-destructive/90 px-2 py-1 text-xs text-white">
                {loadError}
              </p>
            ) : null}
            {!ready && !loadError ? (
              <p className="text-muted-foreground pointer-events-none absolute inset-0 flex items-center justify-center bg-background/40 text-sm">
                Building countryside world…
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Studio controls</CardTitle>
            <CardDescription>WASD / arrows walk · drag look · click fold in the canvas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Render mode</legend>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={mode === "3d" ? "default" : "outline"}
                  disabled={webgl2 === false}
                  onClick={() => setMode("3d")}
                >
                  3D (WebGL2)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={mode === "2d" ? "default" : "outline"}
                  onClick={() => setMode("2d")}
                >
                  2D canvas
                </Button>
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="palette">Palette</Label>
              <select
                id="palette"
                className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-2 text-sm outline-none focus-visible:ring-2"
                value={palette}
                onChange={(e) => setPalette(e.target.value as PaletteName)}
              >
                {PALETTE_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="rise">Fold rise scrubber ({scrubSec.toFixed(2)} s)</Label>
                <span className="text-muted-foreground text-xs">official clock</span>
              </div>
              <input
                id="rise"
                type="range"
                min={0}
                max={RISE_SECONDS}
                step={0.02}
                value={scrubSec}
                disabled={!ready}
                onPointerDown={() => setScrubbing(true)}
                onPointerUp={() => {
                  setScrubbing(false)
                  if (scrubSec >= RISE_SECONDS - 0.05) getApi()?.resume()
                }}
                onChange={(e) => setScrubSec(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="secondary" disabled={!ready} onClick={onPlayRise}>
                  Play rise
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={!ready} onClick={onFoldFlat}>
                  Fold flat (restart)
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={!ready} onClick={onToggleFold}>
                  Toggle fold
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="tilt">Tilt-shift macro lens</Label>
              <Switch
                id="tilt"
                checked={tiltShift}
                onCheckedChange={(v) => setTiltShift(v === true)}
                disabled={!ready}
              />
            </div>
            {mode === "2d" && tiltShift !== true ? (
              <p className="text-muted-foreground text-xs">2D blur is baked at build time — remounts when toggled.</p>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="sound">Paper sound</Label>
              <Switch id="sound" checked={soundOn} onCheckedChange={(v) => setSoundOn(v === true)} disabled={!ready} />
            </div>

            <Button type="button" className="w-full" disabled={!ready} onClick={onExportPng}>
              Export PNG (live canvas)
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}