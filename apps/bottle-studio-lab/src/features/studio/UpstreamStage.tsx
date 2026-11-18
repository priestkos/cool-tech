import { useEffect, useRef, useState } from "react"
import { UPSTREAM_PIN } from "@/upstream/bottle-studio-api"

const STAGE_SRC = "/bottle-studio/index.html"

export function UpstreamStage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const frame = iframeRef.current
    if (!frame) return

    const onLoad = () => {
      setReady(true)
      try {
        const doc = frame.contentDocument
        const canvas = doc?.querySelector("#gl")
        if (!canvas) {
          setError("Upstream stage did not expose #gl canvas.")
        }
      } catch {
        setError(null)
      }
    }

    frame.addEventListener("load", onLoad)
    return () => frame.removeEventListener("load", onLoad)
  }, [])

  return (
    <div className="relative h-full min-h-[calc(100dvh-3.25rem)] w-full overflow-hidden rounded-md border border-border bg-[#0a0807]">
      {!ready && (
        <p className="absolute inset-0 z-10 grid place-items-center text-sm text-muted-foreground">
          Loading vendored Bottle Studio ({UPSTREAM_PIN.tag})…
        </p>
      )}
      {error ? (
        <p className="absolute bottom-3 left-3 z-10 max-w-sm rounded-md border border-destructive/40 bg-background/90 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
      <iframe
        ref={iframeRef}
        title="Bottle Studio upstream stage"
        src={STAGE_SRC}
        className="h-full w-full border-0"
        allow="fullscreen"
      />
    </div>
  )
}