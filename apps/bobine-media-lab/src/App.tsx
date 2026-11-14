import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AudioPlayer } from "@/features/player/AudioPlayer"
import { ShortcutOverlay } from "@/features/player/ShortcutOverlay"
import { applyTheme, resolveInitialTheme, toggleTheme, type LabTheme } from "@/features/player/theme"
import { VideoPlayer } from "@/features/player/VideoPlayer"
import { FIXTURES } from "@/features/lab/fixtures"
import { HlsPanel } from "@/features/lab/HlsPanel"
import { SwapPanel } from "@/features/lab/SwapPanel"

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
              <Badge variant="outline">Clean-room demo</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Independent recreation inspired by{" "}
              <a
                href="https://bobine.fyi"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                bobine
              </a>{" "}
              (Sanyam Punia) — not the official player. No registry source was copied; upstream had
              no visible license at scout time.
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
        <SwapPanel onToggleHelp={() => setHelpOpen((o) => !o)} />
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Video controls slice</CardTitle>
              <CardDescription>Captions, speed, PiP, and fullscreen on the clean-room player.</CardDescription>
            </CardHeader>
            <CardContent>
              <VideoPlayer
                src={FIXTURES.videoMp4}
                captionSrc={FIXTURES.captionsVtt}
                onToggleHelp={() => setHelpOpen((o) => !o)}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Audio player</CardTitle>
              <CardDescription>Same control strip on a local MP3 fixture.</CardDescription>
            </CardHeader>
            <CardContent>
              <AudioPlayer src={FIXTURES.audioMp3} preload="metadata" />
            </CardContent>
          </Card>
        </div>
        <HlsPanel />
        <footer className="text-muted-foreground border-t border-border pt-4 text-xs">
          Credits:{" "}
          <a href="https://bobine.fyi" className="underline" target="_blank" rel="noreferrer">
            bobine.fyi
          </a>
          ,{" "}
          <a
            href="https://x.com/sanyampunia/status/2120796070540365928"
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            launch post
          </a>
          . hls.js is Apache-2.0. Local fixtures only — no runtime network.
        </footer>
      </main>
    </div>
  )
}