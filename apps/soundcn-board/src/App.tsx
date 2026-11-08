import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BoardSlots } from "@/features/board/BoardSlots"
import { EventLogPanel } from "@/features/board/EventLogPanel"
import { MasterControls } from "@/features/board/MasterControls"
import { SoundLibrary } from "@/features/board/SoundLibrary"
import { useSoundBoard } from "@/features/board/useSoundBoard"

const SOUNDCN_SHA = "7cbfbb3f56e8548b81fb26410bdcea657447d087"

function usePrefersReducedMotion() {
  return useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])
}

export default function App() {
  const prefersReduced = usePrefersReducedMotion()
  const [motionPreview, setMotionPreview] = useState(true)
  const motionOn = !prefersReduced && motionPreview

  const board = useSoundBoard()

  return (
    <div
      className="min-h-dvh bg-background text-foreground"
      data-motion={motionOn ? "on" : "off"}
    >
      {!board.unlocked && (
        <div
          className="bg-background/90 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enable-sound-title"
        >
          <div className="border-border bg-card max-w-md space-y-4 rounded-xl border p-6 shadow-lg">
            <h2 id="enable-sound-title" className="font-heading text-xl font-semibold">
              Enable sound
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Audio stays off until you choose to unlock it. Playback uses your click or key press
              only — nothing plays on load.
            </p>
            <Button type="button" className="w-full" onClick={board.unlockSound} autoFocus>
              Enable sound
            </Button>
          </div>
        </div>
      )}

      <header className="border-b border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                soundcn Board
              </h1>
              <Badge variant="outline">soundcn registry</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Tactile UI sounds from pinned{" "}
              <a
                href={`https://github.com/kapishdima/soundcn/tree/${SOUNDCN_SHA}`}
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                kapishdima/soundcn
              </a>{" "}
              — Kenney CC0 assets only (no Blizzard/WoW).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-muted-foreground flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={motionPreview}
                onChange={(e) => setMotionPreview(e.target.checked)}
                disabled={prefersReduced}
              />
              Motion highlight
            </label>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="space-y-8">
          {board.unlocked ? (
            <>
              <BoardSlots
                soundEnabled={board.soundEnabled}
                volume={board.effectiveVolume}
                slotPresets={board.slotPresets}
                toggleOn={board.toggleOn}
                switchOffPreset={board.switchOffPreset}
                onSlotPreset={board.setSlotPreset}
                onToggle={board.setToggleOn}
                onPlayed={board.markPlayed}
              />
              <SoundLibrary
                soundEnabled={board.soundEnabled}
                volume={board.effectiveVolume}
                lastPlayed={board.lastPlayed}
                onPreview={(id) => board.markPlayed(id, "Library preview")}
                motionOn={motionOn}
              />
            </>
          ) : (
            <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              Interactive soundboard controls appear after you enable sound (no AudioContext or decode
              runs until then).
            </p>
          )}
        </div>

        <aside className="space-y-4">
          <MasterControls
            unlocked={board.unlocked}
            muted={board.muted}
            volume={board.volume}
            soundEnabled={board.soundEnabled}
            onMutedChange={board.setMasterMuted}
            onVolumeChange={board.setVolume}
            onReset={board.resetBoard}
          />
          <EventLogPanel entries={board.log} />

          <details className="border-border rounded-lg border p-4 text-sm">
            <summary className="cursor-pointer font-medium">Provenance & licenses</summary>
            <div className="text-muted-foreground mt-3 space-y-2 text-xs leading-relaxed">
              <p>
                <strong className="text-foreground">Code:</strong> soundcn registry MIT © 2026
                KapishDima — hook/engine copied from commit{" "}
                <code className="text-foreground">{SOUNDCN_SHA.slice(0, 12)}…</code>.
              </p>
              <p>
                <strong className="text-foreground">Sounds:</strong> each embedded asset lists CC0 /
                Kenney in its module. WoW/Blizzard collections are excluded per upstream README.
              </p>
              <p>
                <strong className="text-foreground">This demo:</strong> MIT monorepo app; audio
                licenses remain CC0 per asset.
              </p>
            </div>
          </details>
        </aside>
      </main>
    </div>
  )
}
