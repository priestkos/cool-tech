import { useCallback, useState } from "react"
import { ToastProvider } from "@/components/dissolve/toast"
import { Badge } from "@/components/ui/badge"
import { AboutCreditsDialog } from "@/features/AboutCreditsDialog"
import {
  INITIAL_INBOX,
  type InboxItem,
  removeInboxItem,
  restoreInboxItem,
} from "@/features/archive"
import { GallerySection } from "@/features/gallery/GallerySection"
import {
  DissolvePlayground,
  type PlaygroundControls,
} from "@/features/playground/DissolvePlayground"
import { ToastLabControls } from "@/features/toast/ToastLabControls"

export default function App() {
  const [inbox, setInbox] = useState<InboxItem[]>(() => [...INITIAL_INBOX])
  const [scratchRevealed, setScratchRevealed] = useState(false)
  const [playground, setPlayground] = useState<PlaygroundControls>({
    grain: 4,
    duration: 1200,
    direction: "out",
  })

  const removeFirstInbox = useCallback((): InboxItem | null => {
    const removed = inbox[0] ?? null
    if (removed) setInbox((prev) => prev.slice(1))
    return removed
  }, [inbox])

  const restoreInbox = useCallback((item: InboxItem) => {
    setInbox((prev) => restoreInboxItem(prev, item))
  }, [])

  return (
    <ToastProvider
      top={16}
      className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center px-3"
    >
      <div className="min-h-dvh bg-background text-foreground">
        <header className="border-border/70 bg-card/60 border-b backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  Dissolve Dust Lab
                </h1>
                <Badge variant="outline">dissolve-ui 0.0.6 web</Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                Real{" "}
                <a
                  href="https://github.com/dissolve-ui/dissolve"
                  className="text-foreground underline underline-offset-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  dissolve-ui
                </a>{" "}
                registry components — canvas grain engine, not a lookalike. Offline at runtime.
              </p>
            </div>
            <AboutCreditsDialog />
          </div>
        </header>

        <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-2">
          <div className="space-y-6">
            <ToastLabControls
              inbox={inbox}
              onRemoveFirst={removeFirstInbox}
              onRestore={restoreInbox}
            />
            <GallerySection
              inbox={inbox}
              onDeleteInbox={(id) => setInbox((prev) => removeInboxItem(prev, id))}
              scratchRevealed={scratchRevealed}
              onScratchReveal={() => setScratchRevealed(true)}
            />
          </div>
          <DissolvePlayground
            controls={playground}
            onChange={(next) => setPlayground((p) => ({ ...p, ...next }))}
          />
        </main>
      </div>
    </ToastProvider>
  )
}