import { Toaster } from "@yusufceng1z/ding-react"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { PlaygroundControls } from "@/features/toast/PlaygroundControls"
import { ToastInspector } from "@/features/toast/ToastInspector"
import { useDingLab } from "@/features/toast/useDingLab"

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

  const lab = useDingLab(motionEnabled)

  return (
    <>
      <Toaster position="top-center" theme="light" labels={{ region: "Ding notifications" }} />
      <div className="min-h-dvh bg-background text-foreground">
        <header className="border-b border-border/70 bg-card/60 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  Ding Toast Lab
                </h1>
                <Badge variant="outline">@yusufceng1z/ding 0.0.6</Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
                Playground wired to the real{" "}
                <a
                  href="https://github.com/YusufCeng1z/ding"
                  className="text-foreground underline underline-offset-2"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ding
                </a>{" "}
                toast engine (MIT) via{" "}
                <code className="text-xs">@yusufceng1z/ding-react</code> — spring morphs, promise
                helper, and action patches from upstream, not a local reimplementation.
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
          <ToastInspector />
        </main>
      </div>
    </>
  )
}