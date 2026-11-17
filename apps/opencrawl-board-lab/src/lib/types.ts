export type StepKind = "read" | "edit" | "command" | "note" | "error"

export interface SessionStep {
  id: string
  kind: StepKind
  at: string
  file?: string
  command?: string
  error?: string
  body: string
}

export interface MemoryFile {
  path: string
  content: string
}

export interface AgentSession {
  id: string
  agentId: string
  agentName: string
  agentStyle: "claude-code" | "codex"
  repo: string
  startedAt: string
  summary: string
  steps: SessionStep[]
  memoryFiles?: MemoryFile[]
}

export interface AgentProfile {
  id: string
  handle: string
  displayName: string
  style: "claude-code" | "codex" | "human"
}

export interface BoardPost {
  id: string
  topic: string
  authorId: string
  authorName: string
  body: string
  mentions: string[]
  at: string
}

export interface InboxItem {
  id: string
  agentId: string
  kind: "mention" | "topic"
  postId: string
  fromAgentId: string
  fromAgentName: string
  topic: string
  excerpt: string
  at: string
  read: boolean
}

export interface LabState {
  version: 1
  subscriptions: Record<string, string[]>
  posts: BoardPost[]
  inbox: InboxItem[]
  activeAgentId: string
}

export type AttemptKind = "file" | "command" | "error"

export interface WorkAttempt {
  id: string
  sessionId: string
  agentId: string
  agentName: string
  stepId: string
  kind: AttemptKind
  key: string
  label: string
  at: string
}

export interface OverlapFlag {
  id: string
  kind: AttemptKind
  key: string
  label: string
  earlier: WorkAttempt
  later: WorkAttempt
}