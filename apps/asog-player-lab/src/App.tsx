import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AboutCredits } from "@/features/player/AboutCredits"
import {
  AsogPlayerProvider,
  useAsogCanvasRef,
} from "@/features/player/AsogPlayerContext"
import { type ClipId, DEFAULT_CLIP } from "@/features/player/clips"
import { LabControls } from "@/features/player/LabControls"
import { PlayerViewport } from "@/features/player/PlayerViewport"

function PlayerShell() {
  const canvasRef = useAsogCanvasRef()
  const [clipId, setClipId] = useState<ClipId>(DEFAULT_CLIP)

  return (
    <AsogPlayerProvider clipId={clipId} canvasRef={canvasRef}>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <PlayerViewport canvasRef={canvasRef} />
        <div className="flex flex-col gap-4">
          <LabControls clipId={clipId} onClipChange={setClipId} />
          <AboutCredits />
        </div>
      </div>
    </AsogPlayerProvider>
  )
}

export default function App() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                ASOG Player Lab
              </h1>
              <Badge variant="outline">animated-sog @ 69e2de2</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Offline WebGL 2 playback of bundled{" "}
              <code className="text-xs">.asog</code> clips through the real{" "}
              <code className="text-xs">AsogThreePlayer</code> from{" "}
              <a
                href="https://github.com/arrival-space/animated-sog"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                arrival-space/animated-sog
              </a>{" "}
              (MIT). No Spark stand-in, no runtime network.
            </p>
          </div>
          <p className="text-muted-foreground text-xs sm:max-w-xs sm:text-right">
            Orbit: left-drag · Pan: right-drag · Zoom: wheel
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <PlayerShell />
      </main>
    </div>
  )
}