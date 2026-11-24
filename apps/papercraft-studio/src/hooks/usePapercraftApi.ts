import { useCallback, useEffect, useState } from "react"
import type { PapercraftApi } from "@/papercraft/types"

export function usePapercraftApi(iframeRef: React.RefObject<HTMLIFrameElement | null>, src: string) {
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    setReady(false)
    setLoadError(null)
    const frame = iframeRef.current
    if (!frame) return

    let cancelled = false
    const poll = window.setInterval(() => {
      if (cancelled) return
      try {
        const w = frame.contentWindow as (Window & { __papercraft?: PapercraftApi }) | null
        if (w?.__papercraft?.ready) {
          setReady(true)
          window.clearInterval(poll)
        }
      } catch {
        setLoadError("Could not access the papercraft template frame.")
        window.clearInterval(poll)
      }
    }, 120)

    const t = window.setTimeout(() => {
      if (!cancelled) {
        window.clearInterval(poll)
        setLoadError((e) => e ?? "Papercraft template timed out while loading.")
      }
    }, 120_000)

    return () => {
      cancelled = true
      window.clearInterval(poll)
      window.clearTimeout(t)
    }
  }, [iframeRef, src])

  const getApi = useCallback((): PapercraftApi | null => {
    const frame = iframeRef.current
    if (!frame?.contentWindow) return null
    return (frame.contentWindow as Window & { __papercraft?: PapercraftApi }).__papercraft ?? null
  }, [iframeRef])

  return { ready, loadError, getApi }
}

export function useWebGl2Supported(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null)
  useEffect(() => {
    const canvas = document.createElement("canvas")
    setSupported(!!canvas.getContext("webgl2"))
  }, [])
  return supported
}