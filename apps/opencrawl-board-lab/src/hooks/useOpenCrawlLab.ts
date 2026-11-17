import { useCallback, useEffect, useMemo, useState } from "react"
import agentsFixture from "@/fixtures/agents.json"
import {
  BOARD_TOPICS,
  createPost,
  inboxForAgent,
  isSubscribed,
  postsForTopic,
  subscribeTopic,
} from "@/lib/board"
import {
  buildOverlapTimeline,
  detectOverlaps,
  extractWorkAttempts,
} from "@/lib/overlap"
import { createSessionSearch } from "@/lib/search"
import { loadFixtureSessions } from "@/lib/sessions"
import { hydrateLabState, saveLabState } from "@/lib/store"
import type { AgentProfile, AgentSession, LabState } from "@/lib/types"

export type LabTab =
  | "sessions"
  | "search"
  | "board"
  | "inbox"
  | "overlap"

const agents = agentsFixture as AgentProfile[]

export function useOpenCrawlLab() {
  const sessions = useMemo(() => loadFixtureSessions(), [])
  const searchIndex = useMemo(() => createSessionSearch(sessions), [sessions])
  const attempts = useMemo(() => extractWorkAttempts(sessions), [sessions])
  const overlaps = useMemo(() => detectOverlaps(attempts), [attempts])
  const timeline = useMemo(
    () => buildOverlapTimeline(attempts, overlaps),
    [attempts, overlaps]
  )

  const [tab, setTab] = useState<LabTab>("sessions")
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    sessions[0]?.id ?? null
  )
  const [query, setQuery] = useState("cart")
  const [boardTopic, setBoardTopic] = useState<string>(BOARD_TOPICS[0])
  const [draft, setDraft] = useState("")
  const [labState, setLabState] = useState<LabState>(() => hydrateLabState())

  useEffect(() => {
    saveLabState(labState)
  }, [labState])

  const selectedSession: AgentSession | null =
    sessions.find((s) => s.id === selectedSessionId) ?? null

  const searchHits = useMemo(
    () => (query.trim() ? searchIndex.search(query) : []),
    [query, searchIndex]
  )

  const activeAgent =
    agents.find((a) => a.id === labState.activeAgentId) ?? agents[2]

  const setActiveAgent = useCallback((id: string) => {
    setLabState((s) => ({ ...s, activeAgentId: id }))
  }, [])

  const toggleSubscribe = useCallback(
    (topic: string, on: boolean) => {
      setLabState((s) => subscribeTopic(s, labState.activeAgentId, topic, on))
    },
    [labState.activeAgentId]
  )

  const submitPost = useCallback(() => {
    const body = draft.trim()
    if (!body) return
    setLabState((s) =>
      createPost(s, { topic: boardTopic, author: activeAgent, body })
    )
    setDraft("")
  }, [activeAgent, boardTopic, draft])

  const inbox = inboxForAgent(labState, labState.activeAgentId)
  const topicPosts = postsForTopic(labState, boardTopic)

  return {
    tab,
    setTab,
    sessions,
    selectedSession,
    selectedSessionId,
    setSelectedSessionId,
    query,
    setQuery,
    searchHits,
    boardTopic,
    setBoardTopic,
    draft,
    setDraft,
    submitPost,
    labState,
    activeAgent,
    agents,
    setActiveAgent,
    toggleSubscribe,
    isSubscribed: (topic: string) =>
      isSubscribed(labState, labState.activeAgentId, topic),
    inbox,
    topicPosts,
    topics: BOARD_TOPICS,
    timeline,
    overlaps,
  }
}