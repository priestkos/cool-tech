import { useCallback, useEffect, useState } from "react"
import {
  claimPanelControl,
  connectLab,
  disconnectLab,
  fetchLabState,
  refreshDoctor,
  releaseControl,
  runAgentLoop,
  setViewerMode,
} from "./api"
import type { LabState } from "./types"

const INITIAL: LabState = {
  mode: "disconnected",
  engineUrl: "http://127.0.0.1:8080",
  controlHolder: null,
  viewerMode: "view-only",
  capabilities: null,
  status: null,
  doctor: null,
  mock: null,
  lastAgentLoop: null,
}

export function useRelayLab() {
  const [state, setState] = useState<LabState>(INITIAL)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [frameNonce, setFrameNonce] = useState(0)

  const run = useCallback(async (fn: () => Promise<LabState>) => {
    setBusy(true)
    setError(null)
    try {
      const next = await fn()
      setState(next)
      setFrameNonce((n) => n + 1)
      return next
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      throw e
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    void fetchLabState().then(setState).catch(() => {
      /* offline until first connect */
    })
  }, [])

  useEffect(() => {
    if (state.mode === "disconnected") return
    const id = window.setInterval(() => setFrameNonce((n) => n + 1), 2500)
    return () => window.clearInterval(id)
  }, [state.mode])

  const connect = useCallback(
    (forceMock?: boolean) => run(() => connectLab(forceMock)),
    [run],
  )

  return {
    state,
    busy,
    error,
    frameNonce,
    frameUrl:
      state.mode === "disconnected"
        ? null
        : `/api/lab/frame.png?n=${frameNonce}`,
    liveViewerUrl:
      state.mode === "live" ? `${state.engineUrl}/` : null,
    connect,
    disconnect: () => run(disconnectLab),
    claimPanel: () => run(claimPanelControl),
    releaseControl: () => run(releaseControl),
    setViewerMode: (mode: "view-only" | "take-control") => run(() => setViewerMode(mode)),
    runAgentLoop: () => run(runAgentLoop),
    refreshDoctor: () => run(refreshDoctor),
  }
}