import { describe, expect, test } from "bun:test"
import {
  createInitialLabState,
  createPost,
  inboxForAgent,
  markInboxRead,
  parseMentions,
  postsForTopic,
} from "@/lib/board"
import {
  buildOverlapTimeline,
  detectOverlaps,
  extractWorkAttempts,
} from "@/lib/overlap"
import { createSessionSearch, highlightSnippet } from "@/lib/search"
import { parseSession } from "@/lib/sessions"
import { parseLabState, serializeLabState } from "@/lib/store"
import type { AgentProfile, AgentSession, LabState } from "@/lib/types"

const you: AgentProfile = {
  id: "you",
  handle: "you",
  displayName: "You (lab operator)",
  style: "human",
}

function session(
  partial: Partial<AgentSession> & Pick<AgentSession, "id" | "agentId">
): AgentSession {
  return {
    agentName: partial.agentId,
    agentStyle: "claude-code",
    repo: "tiny-shop-checkout",
    startedAt: "2026-11-16T09:00:00.000Z",
    summary: "s",
    steps: [],
    ...partial,
  }
}

describe("session parser rejects malformed input", () => {
  test("rejects non-objects and non-array steps", () => {
    expect(() => parseSession(null)).toThrow(/must be an object/)
    expect(() => parseSession("nope")).toThrow(/must be an object/)
    expect(() => parseSession({ id: "x", steps: {} })).toThrow(/steps must be an array/)
    expect(() => parseSession({ id: "x", steps: [null] })).toThrow(/Step 0 invalid/)
  })

  test("defaults unknown style and fills missing step fields", () => {
    const parsed = parseSession({
      id: "s",
      agentStyle: "mystery",
      steps: [{ kind: "note" }],
      memoryFiles: [{ path: "only-path" }, "bad"],
    })
    expect(parsed.agentStyle).toBe("claude-code")
    expect(parsed.steps[0].id).toBe("step-0")
    expect(parsed.steps[0].file).toBeUndefined()
    expect(parsed.steps[0].command).toBeUndefined()
    expect(parsed.steps[0].error).toBeUndefined()
    expect(parsed.memoryFiles?.[0]).toEqual({ path: "only-path", content: "" })
    expect(parsed.memoryFiles?.[1]).toEqual({ path: "", content: "" })
  })

  test("keeps codex style and omits absent memory", () => {
    const parsed = parseSession({
      agentStyle: "codex",
      steps: [
        {
          id: "1",
          kind: "read",
          file: null,
          command: null,
          error: null,
          body: "b",
        },
      ],
    })
    expect(parsed.agentStyle).toBe("codex")
    expect(parsed.memoryFiles).toBeUndefined()
    expect(parsed.steps[0].file).toBeUndefined()
    expect(parsed.steps[0].command).toBeUndefined()
    expect(parsed.steps[0].error).toBeUndefined()
  })
})

describe("search validation and highlighting", () => {
  test("empty and stopword queries return no hits", () => {
    const index = createSessionSearch([
      session({
        id: "s1",
        agentId: "a",
        summary: "cart coupon",
        steps: [{ id: "1", kind: "note", at: "t", body: "cart" }],
      }),
    ])
    expect(index.search("")).toEqual([])
    expect(index.search("a the to")).toEqual([])
    expect(index.search("x")).toEqual([])
  })

  test("indexes memory files and caps the result list", () => {
    const sessions = [0, 1, 2].map((n) =>
      session({
        id: `s${n}`,
        agentId: `agent-${n}`,
        agentName: `Agent ${n}`,
        summary: "unrelated",
        memoryFiles: [{ path: `mem/${n}.md`, content: `integer cents note ${n}` }],
        steps: [],
      })
    )
    const index = createSessionSearch(sessions)
    const hits = index.search("integer cents", 2)
    expect(hits).toHaveLength(2)
    expect(hits.every((hit) => hit.field.startsWith("memory:"))).toBe(true)
    expect(hits[0].score).toBeGreaterThanOrEqual(hits[1].score)
  })

  test("escapes html and regex metacharacters in highlights", () => {
    const html = highlightSnippet(`<img src=x onerror=alert(1)> cart`, ["cart"])
    expect(html).toContain("&lt;img")
    expect(html).not.toContain("<img")
    expect(html).toContain('<mark class="search-hit">cart</mark>')

    const plus = highlightSnippet("cost is a+b today, ab is different", ["a+b"])
    expect(plus).toContain('<mark class="search-hit">a+b</mark>')
    expect(plus).not.toContain(">ab<")
    expect(highlightSnippet("plain & <ok>", [])).toBe("plain &amp; &lt;ok&gt;")
  })
})

describe("mention and inbox edge cases", () => {
  test("dedupes mentions case-insensitively", () => {
    expect(parseMentions("@You @you, ping @codex-beta.")).toEqual([
      "you",
      "codex-beta",
    ])
    expect(parseMentions("no handles")).toEqual([])
  })

  test("self-mention does not inbox the author", () => {
    const state = createPost(createInitialLabState("you"), {
      topic: "general",
      author: you,
      body: "Note to @you about the board",
      at: "2026-11-17T02:00:00.000Z",
    })
    expect(state.inbox.filter((item) => item.agentId === "you")).toHaveLength(0)
  })

  test("mention suppresses a second topic copy", () => {
    const state = createPost(createInitialLabState("you"), {
      topic: "cart-fix",
      author: you,
      body: "@claude-alpha please recheck the coupon guard",
      at: "2026-11-17T03:00:00.000Z",
    })
    const newest = state.inbox.filter(
      (item) =>
        item.agentId === "claude-alpha" && item.at === "2026-11-17T03:00:00.000Z"
    )
    expect(newest.map((item) => item.kind)).toEqual(["mention"])
  })

  test("routes a mention that is not a subscriber", () => {
    const state = createPost(createInitialLabState("you"), {
      topic: "general",
      author: you,
      body: "cc @stranger-agent",
      at: "2026-11-17T05:00:00.000Z",
    })
    const delivered = state.inbox.filter(
      (item) => item.at === "2026-11-17T05:00:00.000Z"
    )
    expect(delivered).toHaveLength(1)
    expect(delivered[0].agentId).toBe("stranger-agent")
    expect(delivered[0].kind).toBe("mention")
  })

  test("caps excerpts and marks read only for the addressed agent", () => {
    const state = createPost(createInitialLabState("you"), {
      topic: "docs",
      author: you,
      body: "x".repeat(200),
      at: "2026-11-17T04:00:00.000Z",
    })
    const target = state.inbox.find(
      (item) =>
        item.agentId === "codex-beta" &&
        item.kind === "topic" &&
        item.at === "2026-11-17T04:00:00.000Z"
    )
    expect(target).toBeDefined()
    expect(target!.excerpt.length).toBe(120)
    expect(state.inbox.every((item) => item.read === false)).toBe(true)

    const wrongAgent = markInboxRead(state, "you", target!.id)
    expect(wrongAgent.inbox.every((item) => item.read === false)).toBe(true)

    const read = markInboxRead(state, "codex-beta", target!.id)
    expect(read.inbox.filter((item) => item.read).map((item) => item.id)).toEqual([
      target!.id,
    ])
  })

  test("orders topic posts oldest-first and inbox newest-first", () => {
    let state = createInitialLabState("you")
    state = createPost(state, {
      topic: "docs",
      author: you,
      body: "later docs note",
      at: "2026-11-18T00:00:00.000Z",
    })
    state = createPost(state, {
      topic: "docs",
      author: you,
      body: "earlier docs note",
      at: "2026-11-15T00:00:00.000Z",
    })
    expect(postsForTopic(state, "docs").map((post) => post.body)).toEqual([
      "earlier docs note",
      "later docs note",
    ])
    const inbox = inboxForAgent(state, "codex-beta")
    expect(inbox[0].excerpt).toBe("later docs note")
    expect(inbox[inbox.length - 1].excerpt).toBe("earlier docs note")
    const times = inbox.map((item) => item.at)
    expect(times).toEqual([...times].sort((a, b) => b.localeCompare(a)))
  })
})

describe("overlap normalization", () => {
  test("collapses case, whitespace, and slash differences across agents", () => {
    const attempts = extractWorkAttempts([
      session({
        id: "a",
        agentId: "claude-alpha",
        steps: [
          {
            id: "1",
            kind: "edit",
            at: "2026-11-16T09:00:00.000Z",
            file: "SRC\\Cart.ts",
            body: "",
          },
          {
            id: "2",
            kind: "command",
            at: "2026-11-16T09:01:00.000Z",
            command: "Bun   Test src/cart.test.ts",
            body: "",
          },
          {
            id: "3",
            kind: "error",
            at: "2026-11-16T09:02:00.000Z",
            error: "AssertionError:  Expected 1200",
            body: "",
          },
          {
            id: "4",
            kind: "read",
            at: "2026-11-16T09:03:00.000Z",
            file: "README.md",
            body: "",
          },
          {
            id: "5",
            kind: "edit",
            at: "2026-11-16T09:04:00.000Z",
            body: "no file",
          },
          {
            id: "6",
            kind: "command",
            at: "2026-11-16T09:05:00.000Z",
            body: "no command",
          },
        ],
      }),
      session({
        id: "b",
        agentId: "codex-beta",
        agentStyle: "codex",
        steps: [
          {
            id: "1",
            kind: "edit",
            at: "2026-11-16T10:00:00.000Z",
            file: "src/cart.ts",
            body: "",
          },
          {
            id: "2",
            kind: "command",
            at: "2026-11-16T10:01:00.000Z",
            command: "bun test src/cart.test.ts",
            body: "",
          },
          {
            id: "3",
            kind: "error",
            at: "2026-11-16T10:02:00.000Z",
            error: "assertionerror: expected 1200",
            body: "",
          },
          {
            id: "4",
            kind: "command",
            at: "2026-11-16T10:03:00.000Z",
            command: "bun test src/cart.test.ts",
            body: "",
          },
        ],
      }),
    ])
    expect(attempts).toHaveLength(7)
    const flags = detectOverlaps(attempts)
    expect(flags.filter((flag) => flag.kind === "file").map((flag) => flag.key)).toEqual([
      "src/cart.ts",
    ])
    const commandFlags = flags.filter((flag) => flag.kind === "command")
    expect(commandFlags).toHaveLength(2)
    expect(commandFlags.every((flag) => flag.key === "bun test src/cart.test.ts")).toBe(
      true
    )
    expect(commandFlags.every((flag) => flag.earlier.agentId === "claude-alpha")).toBe(
      true
    )
    expect(
      flags.filter((flag) => flag.kind === "error").map((flag) => flag.key)
    ).toEqual(["assertionerror: expected 1200"])
    expect(flags.some((flag) => flag.key.includes("readme"))).toBe(false)
  })

  test("same agent repeating work is not an overlap", () => {
    const attempts = extractWorkAttempts([
      session({
        id: "a",
        agentId: "claude-alpha",
        steps: [
          {
            id: "1",
            kind: "command",
            at: "2026-11-16T09:00:00.000Z",
            command: "bun test",
            body: "",
          },
          {
            id: "2",
            kind: "command",
            at: "2026-11-16T09:10:00.000Z",
            command: "bun test",
            body: "",
          },
        ],
      }),
    ])
    expect(detectOverlaps(attempts)).toEqual([])
  })

  test("timeline marks only the later attempt", () => {
    const attempts = extractWorkAttempts([
      session({
        id: "a",
        agentId: "claude-alpha",
        steps: [
          {
            id: "1",
            kind: "edit",
            at: "2026-11-16T09:00:00.000Z",
            file: "src/cart.ts",
            body: "",
          },
        ],
      }),
      session({
        id: "b",
        agentId: "codex-beta",
        steps: [
          {
            id: "1",
            kind: "edit",
            at: "2026-11-16T10:00:00.000Z",
            file: "src/cart.ts",
            body: "",
          },
        ],
      }),
    ])
    const flags = detectOverlaps(attempts)
    const timeline = buildOverlapTimeline(attempts, flags)
    expect(timeline[0].overlap).toBeUndefined()
    expect(timeline[1].overlap?.later.id).toBe(timeline[1].attempt.id)
    expect(timeline[1].overlap?.earlier.agentId).toBe("claude-alpha")
  })
})

describe("lab state validation", () => {
  test("rejects unsupported versions and incomplete shapes", () => {
    expect(() => parseLabState(`{"version":2,"posts":[],"inbox":[]}`)).toThrow(
      /Unsupported lab state version/
    )
    expect(() => parseLabState(`{"version":1,"posts":[]}`)).toThrow(
      /Invalid lab state shape/
    )
    expect(() => parseLabState(`{"version":1,"inbox":[]}`)).toThrow(
      /Invalid lab state shape/
    )
  })

  test("round-trips a minimal valid state", () => {
    const state: LabState = {
      version: 1,
      subscriptions: { you: ["general"] },
      posts: [],
      inbox: [],
      activeAgentId: "you",
    }
    expect(parseLabState(serializeLabState(state))).toEqual(state)
  })
})
