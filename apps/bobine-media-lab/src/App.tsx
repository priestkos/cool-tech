import { useEffect, useState } from "react"
import { AudioPlayer, VideoPlayer } from "bobinejs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { FIXTURES, captionTracks } from "@/features/lab/fixtures"
import { HlsPanel } from "@/features/lab/HlsPanel"
import { ShortcutOverlay } from "@/features/lab/ShortcutOverlay"
import { SwapPanel } from "@/features/lab/SwapPanel"
import { applyTheme, resolveInitialTheme, toggleTheme, type LabTheme } from "@/features/lab/theme"

const BOBINE_PIN = "bobinejs@0.2.2"

export default function App() {
  const [theme, setTheme] = useState<LabTheme>(() => resolveInitialTheme())
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "?") return
      const active = document.activeElement
      const typing =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement
      if (typing) return
      event.preventDefault()
      setHelpOpen((open) => !open)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <ShortcutOverlay open={helpOpen} onClose={() => setHelpOpen(false)} />
      <header className="border-b border-border/70 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Bobine Media Lab
              </h1>
              <Badge variant="secondary">Real upstream</Badge>
              <Badge variant="outline">{BOBINE_PIN}</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Local offline demo using the official{" "}
              <a
                href="https://bobine.fyi"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                bobine
              </a>{" "}
              React players from npm ({BOBINE_PIN}, MIT). Fixtures only — no remote media.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <div className="flex items-center gap-2">
              <Label htmlFor="theme-switch" className="text-xs">
                Dark theme
              </Label>
              <Switch
                id="theme-switch"
                checked={theme === "dark"}
                onCheckedChange={() => setTheme((t) => toggleTheme(t))}
              />
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => setHelpOpen(true)}>
              Shortcuts (?)
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8">
        <SwapPanel />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Video controls slice</CardTitle>
              <CardDescription>
                Official bobinejs <code>VideoPlayer</code> — captions, speed, PiP, fullscreen.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoPlayer
                src={FIXTURES.videoMp4}
                tracks={captionTracks}
                preload="metadata"
                persistKey="bobine-media-lab-video"
                metadata={{ title: "Lab clip", artist: "Local fixture" }}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Audio player</CardTitle>
              <CardDescription>
                bobinejs <code>AudioPlayer</code> on a local MP3 with speed toggle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AudioPlayer
                src={FIXTURES.audioMp3}
                preload="metadata"
                title="Lab tone"
                description="Local MP3 fixture"
                showSpeed
                persistKey="bobine-media-lab-audio"
              />
            </CardContent>
          </Card>
        </div>
        <HlsPanel />
        <footer className="text-muted-foreground border-t border-border pt-4 text-xs">
          Upstream:{" "}
          <a
            href="https://github.com/SanyamPunia/bobine"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            github.com/SanyamPunia/bobine
          </a>{" "}
          ·{" "}
          <a href="https://bobine.fyi" className="underline" target="_blank" rel="noreferrer">
            bobine.fyi
          </a>{" "}
          · MIT ({BOBINE_PIN}). Peer{" "}
          <a href="https://github.com/video-dev/hls.js" className="underline" target="_blank" rel="noreferrer">
            hls.js
          </a>{" "}
          Apache-2.0, lazy-loaded for HLS only.
        </footer>
      </main>
    </div>
  )
}