import initialPosts from "@/fixtures/initial-posts.json"
import type { AgentProfile, BoardPost, InboxItem, LabState } from "@/lib/types"

export const BOARD_TOPICS = ["cart-fix", "docs", "general"] as const

export type BoardTopic = (typeof BOARD_TOPICS)[number]

const MENTION_RE = /@([a-z0-9-]+)/gi

export function parseMentions(body: string): string[] {
  const found = new Set<string>()
  let m: RegExpExecArray | null
  const re = new RegExp(MENTION_RE.source, MENTION_RE.flags)
  while ((m = re.exec(body)) !== null) {
    found.add(m[1].toLowerCase())
  }
  return [...found]
}

export function createInitialLabState(activeAgentId = "you"): LabState {
  const posts = (initialPosts as BoardPost[]).map(normalizePost)
  const subscriptions: Record<string, string[]> = {
    "claude-alpha": ["cart-fix"],
    "codex-beta": ["cart-fix", "docs"],
    you: ["general"],
  }
  const inbox: InboxItem[] = []
  for (const post of posts) {
    appendInboxForPost(inbox, post, subscriptions)
  }
  return {
    version: 1,
    subscriptions,
    posts,
    inbox,
    activeAgentId,
  }
}

function normalizePost(raw: BoardPost): BoardPost {
  const mentions = parseMentions(raw.body)
  return { ...raw, mentions }
}

export function subscribeTopic(
  state: LabState,
  agentId: string,
  topic: string,
  subscribed: boolean
): LabState {
  const set = new Set(state.subscriptions[agentId] ?? [])
  if (subscribed) set.add(topic)
  else set.delete(topic)
  return {
    ...state,
    subscriptions: { ...state.subscriptions, [agentId]: [...set] },
  }
}

export function isSubscribed(state: LabState, agentId: string, topic: string): boolean {
  return (state.subscriptions[agentId] ?? []).includes(topic)
}

export function createPost(
  state: LabState,
  input: {
    topic: string
    author: AgentProfile
    body: string
    at?: string
  }
): LabState {
  const mentions = parseMentions(input.body)
  const post: BoardPost = {
    id: `post-${crypto.randomUUID()}`,
    topic: input.topic,
    authorId: input.author.id,
    authorName: input.author.displayName,
    body: input.body,
    mentions,
    at: input.at ?? new Date().toISOString(),
  }
  const inbox = [...state.inbox]
  appendInboxForPost(inbox, post, state.subscriptions)
  return {
    ...state,
    posts: [...state.posts, post],
    inbox,
  }
}

function appendInboxForPost(
  inbox: InboxItem[],
  post: BoardPost,
  subscriptions: Record<string, string[]>
): void {
  const at = post.at
  for (const mention of post.mentions) {
    if (mention === post.authorId) continue
    inbox.push({
      id: `inbox-${crypto.randomUUID()}`,
      agentId: mention,
      kind: "mention",
      postId: post.id,
      fromAgentId: post.authorId,
      fromAgentName: post.authorName,
      topic: post.topic,
      excerpt: post.body.slice(0, 120),
      at,
      read: false,
    })
  }
  for (const [agentId, topics] of Object.entries(subscriptions)) {
    if (agentId === post.authorId) continue
    if (!topics.includes(post.topic)) continue
    const alreadyMentioned = post.mentions.includes(agentId)
    if (alreadyMentioned) continue
    inbox.push({
      id: `inbox-${crypto.randomUUID()}`,
      agentId,
      kind: "topic",
      postId: post.id,
      fromAgentId: post.authorId,
      fromAgentName: post.authorName,
      topic: post.topic,
      excerpt: post.body.slice(0, 120),
      at,
      read: false,
    })
  }
}

export function postsForTopic(state: LabState, topic: string): BoardPost[] {
  return state.posts
    .filter((p) => p.topic === topic)
    .sort((a, b) => a.at.localeCompare(b.at))
}

export function inboxForAgent(state: LabState, agentId: string): InboxItem[] {
  return state.inbox
    .filter((i) => i.agentId === agentId)
    .sort((a, b) => b.at.localeCompare(a.at))
}

export function markInboxRead(state: LabState, agentId: string, itemId: string): LabState {
  return {
    ...state,
    inbox: state.inbox.map((i) =>
      i.id === itemId && i.agentId === agentId ? { ...i, read: true } : i
    ),
  }
}