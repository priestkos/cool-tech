import { useCallback, useEffect, useRef, useState } from "react"
import type { ColorMode, FixtureId, LabPreferences } from "@/lab/types.ts"
import {
  isPreferencesPatchMessage,
  LAB_CHANNEL,
  type LabStateMessage,
} from "@/astryx-frame/protocol.ts"

type Props = {
  fixture: FixtureId
  colorMode: ColorMode
  preferences: LabPreferences
  onPreferencesChange: (patch: Partial<LabPreferences>) => void
}

export function AstryxPane({
  fixture,
  colorMode,
  preferences,
  onPreferencesChange,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [frameReady, setFrameReady] = useState(false)

  const postState = useCallback(() => {
    const win = iframeRef.current?.contentWindow
    if (!win || !frameReady) return
    const msg: LabStateMessage = {
      channel: LAB_CHANNEL,
      type: "lab-state",
      fixture,
      colorMode,
      preferences,
    }
    win.postMessage(msg, window.location.origin)
  }, [fixture, colorMode, preferences, frameReady])

  useEffect(() => {
    postState()
  }, [postState])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!event.data || typeof event.data !== "object") return
      if (event.data.channel !== LAB_CHANNEL) return
      if (event.data.type === "frame-ready") {
        setFrameReady(true)
        return
      }
      if (isPreferencesPatchMessage(event.data)) {
        onPreferencesChange(event.data.patch)
      }
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [onPreferencesChange])

  return (
    <section
      className="astryx-pane rounded-xl border border-border/60 bg-muted/30 p-3"
      aria-label="Astryx preview"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
        <div>
          <p className="text-xs font-medium text-foreground">Astryx</p>
          <p className="text-muted-foreground text-[11px]">
            @astryxdesign/core@0.7.8 · theme-neutral@0.7.8
          </p>
        </div>
        <span className="rounded-md bg-background px-2 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border">
          Isolated frame
        </span>
      </header>
      <p className="text-muted-foreground mb-2 text-[10px] leading-snug">
        Stylesheet firewall: Astryx reset/CSS loads only in{" "}
        <code className="text-foreground">astryx-frame.html</code> (separate
        document). Tailwind Preflight does not apply inside the frame.
      </p>
      <iframe
        ref={iframeRef}
        title="Astryx fixture preview"
        src="/astryx-frame.html"
        className="h-[min(520px,70vh)] w-full rounded-lg border border-border bg-background"
      />
    </section>
  )
}
