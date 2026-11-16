import { useCallback, useMemo, useState } from "react"
import { buildDomTreeFromDocument } from "@/cdp/dom-tree"
import { collectConsoleLines } from "@/cdp/console"
import { CdpLiveClient, connectionFailureState } from "@/cdp/live-client"
import { sliceTranscript, findResponseForRequest } from "@/cdp/replay"
import {
  createStepLogState,
  setScrubIndex,
  type StepLogState,
} from "@/cdp/step-log-state"
import { LAB_PAGES } from "@/fixtures/pages"
import {
  AGENT_TASK_TRANSCRIPT,
  PAGE_LOAD_TRANSCRIPTS,
} from "@/fixtures/transcripts"
import type { DomTreeNode } from "@/cdp/dom-tree"
import type { ConnectionState, TranscriptEntry } from "@/cdp/types"
import { KITE_INTRO_SCREENSHOT_PATH } from "@/fixtures/screenshot-data"

const LIVE_WS = "ws://127.0.0.1:8787"

export function useCdpLab() {
  const [selectedPageId, setSelectedPageId] = useState(LAB_PAGES[0].id)
  const [loadIndex, setLoadIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [liveMode, setLiveMode] = useState(false)
  const [liveState, setLiveState] = useState<ConnectionState>("disconnected")
  const [liveMessage, setLiveMessage] = useState<string | null>(null)
  const [agentState, setAgentState] = useState<StepLogState>(() =>
    createStepLogState("agent-walk", AGENT_TASK_TRANSCRIPT.length)
  )

  const loadTranscript = PAGE_LOAD_TRANSCRIPTS[selectedPageId] ?? PAGE_LOAD_TRANSCRIPTS["kite-intro"]

  const loadSnapshot = useMemo(
    () => sliceTranscript(loadTranscript, loaded ? loadTranscript.length - 1 : loadIndex),
    [loadTranscript, loadIndex, loaded]
  )

  const agentSnapshot = useMemo(
    () => sliceTranscript(AGENT_TASK_TRANSCRIPT, agentState.scrubIndex),
    [agentState.scrubIndex]
  )

  const domTree: DomTreeNode | null = useMemo(() => {
    const entry = [...loadSnapshot.visible]
      .reverse()
      .find(
        (e) =>
          e.direction === "response" &&
          "id" in e.payload &&
          e.payload.id === 2
      )
    const root = (entry?.payload as { result?: { root?: unknown } })?.result?.root
    return buildDomTreeFromDocument(root as never)
  }, [loadSnapshot.visible])

  const consoleLines = useMemo(
    () => collectConsoleLines(loadSnapshot.visible),
    [loadSnapshot.visible]
  )

  const screenshotSrc = useMemo(() => {
    const shot = findResponseForRequest(loadSnapshot.visible, 3, loadSnapshot.index)
    const data = (shot?.payload as { result?: { data?: string } })?.result?.data
    if (data) return `data:image/png;base64,${data}`
    return KITE_INTRO_SCREENSHOT_PATH
  }, [loadSnapshot])

  const runLoad = useCallback(() => {
    setLoaded(true)
    setLoadIndex(loadTranscript.length - 1)
  }, [loadTranscript.length])

  const scrubLoad = useCallback((index: number) => {
    setLoaded(false)
    setLoadIndex(index)
  }, [])

  const scrubAgent = useCallback((index: number) => {
    setAgentState((s) =>
      setScrubIndex(s, index, AGENT_TASK_TRANSCRIPT.length - 1)
    )
  }, [])

  const toggleLive = useCallback(
    async (next: boolean) => {
      setLiveMode(next)
      if (!next) {
        setLiveState("disconnected")
        setLiveMessage(null)
        return
      }
      const client = new CdpLiveClient({ url: LIVE_WS })
      setLiveState("connecting")
      setLiveMessage(null)
      try {
        await client.connect()
        setLiveState(client.state)
        setLiveMessage("Connected to local Kitesurf WebSocket.")
        client.disconnect()
      } catch (err) {
        const fail = connectionFailureState(err)
        setLiveState(fail.state)
        setLiveMessage(fail.message)
      }
    },
    []
  )

  return {
    pages: LAB_PAGES,
    selectedPageId,
    setSelectedPageId,
    loadTranscript,
    loadSnapshot,
    runLoad,
    scrubLoad,
    loaded,
    domTree,
    consoleLines,
    screenshotSrc,
    agentTranscript: AGENT_TASK_TRANSCRIPT,
    agentSnapshot,
    agentState,
    scrubAgent,
    liveMode,
    liveState,
    liveMessage,
    toggleLive,
    liveWsUrl: LIVE_WS,
  }
}

export function formatEntry(entry: TranscriptEntry) {
  return JSON.stringify(entry.payload, null, 2)
}