import { describe, expect, test } from "bun:test"
import {
  createInitialLabState,
  createPost,
  isSubscribed,
  parseMentions,
  subscribeTopic,
} from "@/lib/board"
import { detectOverlaps, extractWorkAttempts } from "@/lib/overlap"
import {
  createSessionSearch,
  highlightSnippet,
} from "@/lib/search"
import { loadFixtureSessions, parseSession } from "@/lib/sessions"
import { roundTripLabState } from "@/lib/store"
import agents from "@/fixtures/agents.json"
import type { AgentProfile } from "@/lib/types"

describe("fixture session parsing", () => {
  test("loads all fixture sessions with steps", () => {
    const sessions = loadFixtureSessions()
    expect(sessions.length).toBe(2)
    expect(sessions[0].steps.length).toBeGreaterThan(0)
  })

  test("rejects invalid step kind", () => {
    const bad = {
      id: "x",
      agentId: "a",
      agentName: "A",
      agentStyle: "codex",
      repo: "r",
      startedAt: "t",
      summary: "s",
      steps: [{ id: "1", kind: "fly", at: "t", body: "b" }],
    }
    expect(() => parseSession(bad)).toThrow(/invalid kind/)
  })
})

describe("full-text search", () => {
  test("ranks cart-related hits above unrelated README edit", () => {
    const sessions = loadFixtureSessions()
    const index = createSessionSearch(sessions)
    const hits = index.search("cart coupon AssertionError")
    expect(hits.length).toBeGreaterThan(0)
    const top = hits[0]
    expect(top.sessionId).toMatch(/claude|codex/)
    expect(top.highlightedHtml).toContain("search-hit")
    expect(highlightSnippet("cart coupon", ["coupon"])).toContain("<mark")
  })
})

describe("board subscriptions and fan-out", () => {
  test("topic fan-out reaches subscribers not author", () => {
    let state = createInitialLabState("you")
    state = subscribeTopic(state, "you", "cart-fix", true)
    const author = agents.find((a) => a.id === "you") as AgentProfile
    state = createPost(state, {
      topic: "cart-fix",
      author,
      body: "Subscribers should see this cart-fix note.",
      at: "2026-11-17T00:00:00.000Z",
    })
    expect(
      state.inbox.some(
        (i) => i.kind === "topic" && i.agentId === "claude-alpha" && !i.read
      )
    ).toBe(true)
    expect(
      state.inbox.filter((i) => i.agentId === "you" && i.kind === "topic").length
    ).toBe(0)
  })

  test("subscribe toggle", () => {
    let state = createInitialLabState()
    expect(isSubscribed(state, "you", "cart-fix")).toBe(false)
    state = subscribeTopic(state, "you", "cart-fix", true)
    expect(isSubscribed(state, "you", "cart-fix")).toBe(true)
    state = subscribeTopic(state, "you", "cart-fix", false)
    expect(isSubscribed(state, "you", "cart-fix")).toBe(false)
  })
})

describe("@mention routing", () => {
  test("parses handles and delivers inbox", () => {
    expect(parseMentions("Hi @claude-alpha and @codex-beta")).toEqual([
      "claude-alpha",
      "codex-beta",
    ])
    let state = createInitialLabState("you")
    const author = agents.find((a) => a.id === "you") as AgentProfile
    state = createPost(state, {
      topic: "general",
      author,
      body: "Ping @codex-beta about overlap panel",
      at: "2026-11-17T01:00:00.000Z",
    })
    const mention = state.inbox.find(
      (i) => i.agentId === "codex-beta" && i.kind === "mention"
    )
    expect(mention).toBeDefined()
    expect(mention?.excerpt).toContain("@codex-beta")
  })

  test("fixture mention delivered to claude-alpha", () => {
    const state = createInitialLabState()
    expect(
      state.inbox.some(
        (i) => i.agentId === "claude-alpha" && i.kind === "mention"
      )
    ).toBe(true)
  })
})

describe("overlap detection", () => {
  test("flags duplicate file, command, and error across agents", () => {
    const attempts = extractWorkAttempts(loadFixtureSessions())
    const flags = detectOverlaps(attempts)
    const kinds = new Set(flags.map((f) => f.kind))
    expect(kinds.has("file")).toBe(true)
    expect(kinds.has("command")).toBe(true)
    expect(kinds.has("error")).toBe(true)
    const fileOverlap = flags.find((f) => f.kind === "file")
    expect(fileOverlap?.earlier.agentId).not.toBe(fileOverlap?.later.agentId)
  })

  test("does not flag distinct README-only work as cart overlap", () => {
    const attempts = extractWorkAttempts(loadFixtureSessions())
    const flags = detectOverlaps(attempts)
    const readmeOnly = flags.filter((f) => f.key.includes("readme"))
    expect(readmeOnly.length).toBe(0)
  })
})

describe("board store round-trip", () => {
  test("serializes and parses lab state", () => {
    const state = createInitialLabState()
    const round = roundTripLabState(state)
    expect(round.posts.length).toBe(state.posts.length)
    expect(round.inbox.length).toBe(state.inbox.length)
    expect(round.subscriptions).toEqual(state.subscriptions)
  })
})