import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { PlaygroundControls } from "@/features/toast/PlaygroundControls"
import { ToastStage } from "@/features/toast/ToastStage"
import { useToastLab } from "@/features/toast/useToastLab"

function usePrefersReducedMotion() {
  return useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])
}

export default function App() {
  const prefersReduced = usePrefersReducedMotion()
  const [motionOverride, setMotionOverride] = useState(true)
  const motionEnabled = !prefersReduced && motionOverride

  const lab = useToastLab()

  return (
    <div className="min-h-dvh bg-background text-foreground" data-motion={motionEnabled ? "on" : "off"}>
      <header className="border-b border-border/70 bg-card/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                Ding Toast Lab
              </h1>
              <Badge variant="outline">Inspired demo</Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
              Independent playground inspired by{" "}
              <a
                href="https://github.com/YusufCeng1z/ding"
                className="text-foreground underline underline-offset-2"
                target="_blank"
                rel="noreferrer"
              >
                Ding
              </a>
              . Upstream is too new for import — behavior is rebuilt with local React state and CSS
              morph transitions only.
            </p>
          </div>
          <p className="text-muted-foreground text-xs sm:max-w-xs sm:text-right">
            Offline fixtures · no API keys · single visible toast
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr]">
        <PlaygroundControls
          motionEnabled={motionEnabled}
          onMotionChange={setMotionOverride}
          onSuccess={lab.showSuccess}
          onError={lab.showError}
          onPromiseResolve={() => lab.runPromise("resolve")}
          onPromiseReject={() => lab.runPromise("reject")}
          onProgress={lab.runProgress}
          onArchiveUndo={lab.archiveWithUndo}
          onInterrupt={lab.interruptRapid}
          onDismiss={lab.dismiss}
          items={lab.items}
        />
        <ToastStage
          toast={lab.toast}
          motionEnabled={motionEnabled}
          dismissPaused={lab.dismissPaused}
          onDismiss={lab.dismiss}
          onAction={lab.onToastAction}
          onMarkErrorAnnounced={lab.markErrorLive}
          onPauseChange={lab.setDismissPaused}
        />
      </main>
    </div>
  )
}
