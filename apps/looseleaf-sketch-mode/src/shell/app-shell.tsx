import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  defaultAppState,
  iframeQuery,
  parseAppState,
  serializeAppState,
  toggleSketchMode,
  type AppState,
  type ScreenId,
  type ViewMode,
} from "@/lib/app-state"

const LOOSELEAF_PIN = "3343cadb65f9d948818276198272388c99b9f380"

export function AppShell() {
  const [state, setState] = useState<AppState>(() =>
    parseAppState(window.location.search),
  )

  useEffect(() => {
    const qs = serializeAppState(state)
    const path = `${window.location.pathname}${qs}`
    window.history.replaceState(null, "", path)
  }, [state])

  const plainSrc = useMemo(() => `/plain.html${iframeQuery(state)}`, [state])
  const sketchSrc = useMemo(() => `/sketch.html${iframeQuery(state)}`, [state])

  const setScreen = useCallback((screen: ScreenId) => {
    setState((s) => ({ ...s, screen }))
  }, [])

  const setView = useCallback((view: ViewMode) => {
    setState((s) => ({ ...s, view }))
  }, [])

  const setTheme = useCallback((theme: AppState["theme"]) => {
    setState((s) => ({ ...s, theme }))
  }, [])

  const onSketchToggle = useCallback(() => {
    setState((s) => toggleSketchMode(s))
  }, [])

  const showPlain = state.view === "side" || state.flipKit === "plain"
  const showSketch = state.view === "side" || state.flipKit === "sketch"

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <div className="mx-auto flex max-w-6xl flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Unofficial community demo. Not affiliated with Kevin Ngo or the Looseleaf project.
              </p>
              <h1 className="text-xl font-semibold tracking-tight">Looseleaf Sketch Mode</h1>
              <p className="text-sm text-muted-foreground">
                Same JSX, plain shadcn/ui vs Looseleaf (
                <a
                  className="underline"
                  href="https://github.com/kevintngo/looseleaf"
                  rel="noreferrer"
                  target="_blank"
                >
                  repo
                </a>
                ,{" "}
                <a
                  className="underline"
                  href="https://x.com/kevin_t_ngo/status/2116929610122395995"
                  rel="noreferrer"
                  target="_blank"
                >
                  source post
                </a>
                ). Pinned Looseleaf {LOOSELEAF_PIN.slice(0, 7)}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={state.theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                Light
              </Button>
              <Button
                variant={state.theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                Dark
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">View</span>
            <Button
              size="sm"
              variant={state.view === "side" ? "default" : "outline"}
              onClick={() => setView("side")}
            >
              Side by side
            </Button>
            <Button
              size="sm"
              variant={state.view === "flip" ? "default" : "outline"}
              onClick={() => setView("flip")}
            >
              Sketch mode flip
            </Button>
            <Button size="sm" variant="secondary" onClick={onSketchToggle}>
              Sketch mode toggle
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Screen</span>
            {(["settings", "dashboard", "gallery"] as const).map((screen) => (
              <Button
                key={screen}
                size="sm"
                variant={state.screen === screen ? "default" : "outline"}
                onClick={() => setScreen(screen)}
              >
                {screen.charAt(0).toUpperCase() + screen.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 p-4">
        <div
          className={
            state.view === "side"
              ? "grid flex-1 gap-4 md:grid-cols-2"
              : "grid flex-1 grid-cols-1"
          }
        >
          {showPlain ? (
            <section className="flex min-h-[480px] flex-col overflow-hidden rounded-lg border border-border">
              <div className="border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium">
                Plain shadcn/ui (Radix, mira)
              </div>
              <iframe
                key={plainSrc}
                className="min-h-[440px] flex-1 bg-background"
                src={plainSrc}
                title="Plain shadcn settings"
              />
            </section>
          ) : null}
          {showSketch ? (
            <section className="flex min-h-[480px] flex-col overflow-hidden rounded-lg border border-border">
              <div className="border-b border-border bg-muted/40 px-3 py-2 text-xs font-medium">
                Looseleaf sketch kit
              </div>
              <iframe
                key={sketchSrc}
                className="min-h-[440px] flex-1 bg-background"
                src={sketchSrc}
                title="Looseleaf sketch settings"
              />
            </section>
          ) : null}
        </div>
        {state.view === "flip" ? (
          <p className="text-center text-xs text-muted-foreground">
            Flip view shows {state.flipKit === "plain" ? "plain shadcn" : "Looseleaf"} — use Sketch
            mode toggle to swap kits without changing JSX.
          </p>
        ) : null}
      </main>
    </div>
  )
}

export function AppShellWithDefaults() {
  const [ready] = useState(() => {
    if (!window.location.search) {
      const qs = serializeAppState(defaultAppState())
      window.history.replaceState(null, "", `${window.location.pathname}${qs}`)
    }
    return true
  })
  if (!ready) return null
  return <AppShell />
}
