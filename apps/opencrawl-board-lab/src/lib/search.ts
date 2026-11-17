import type { AgentSession } from "@/lib/types"

export interface SearchDocument {
  sessionId: string
  sessionTitle: string
  agentName: string
  field: string
  text: string
}

export interface SearchHit {
  sessionId: string
  agentName: string
  score: number
  field: string
  snippet: string
  highlightedHtml: string
}

const STOP = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "to",
  "in",
  "on",
  "for",
  "of",
  "is",
  "it",
])

function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9_./-]+/g)
    .filter((t) => t.length > 1 && !STOP.has(t))
}

function docTokens(text: string): string[] {
  return tokenize(text)
}

export function buildSessionDocuments(sessions: AgentSession[]): SearchDocument[] {
  const docs: SearchDocument[] = []
  for (const s of sessions) {
    docs.push({
      sessionId: s.id,
      sessionTitle: s.summary,
      agentName: s.agentName,
      field: "summary",
      text: `${s.summary} ${s.repo} ${s.agentName}`,
    })
    for (const step of s.steps) {
      const text = [step.body, step.file, step.command, step.error]
        .filter(Boolean)
        .join(" ")
      docs.push({
        sessionId: s.id,
        sessionTitle: s.summary,
        agentName: s.agentName,
        field: `step:${step.id}`,
        text,
      })
    }
    for (const mem of s.memoryFiles ?? []) {
      docs.push({
        sessionId: s.id,
        sessionTitle: s.summary,
        agentName: s.agentName,
        field: `memory:${mem.path}`,
        text: `${mem.path} ${mem.content}`,
      })
    }
  }
  return docs
}

export class SessionSearchIndex {
  private readonly docs: SearchDocument[]
  private readonly df = new Map<string, number>()
  private readonly postings = new Map<string, Set<number>>()

  constructor(docs: SearchDocument[]) {
    this.docs = docs
  }

  build(): void {
    this.df.clear()
    this.postings.clear()
    for (let i = 0; i < this.docs.length; i++) {
      const terms = new Set(docTokens(this.docs[i].text))
      for (const term of terms) {
        this.df.set(term, (this.df.get(term) ?? 0) + 1)
        let set = this.postings.get(term)
        if (!set) {
          set = new Set()
          this.postings.set(term, set)
        }
        set.add(i)
      }
    }
  }

  search(query: string, limit = 20): SearchHit[] {
    const terms = tokenize(query)
    if (terms.length === 0) return []

    const scores = new Map<number, number>()
    const N = this.docs.length
    for (const term of terms) {
      const df = this.df.get(term) ?? 0
      if (df === 0) continue
      const idf = Math.log(1 + N / df)
      const postings = this.postings.get(term)
      if (!postings) continue
      for (const docIdx of postings) {
        const text = this.docs[docIdx].text.toLowerCase()
        const freq = text.split(term).length - 1
        const tf = 1 + Math.log(1 + freq)
        scores.set(docIdx, (scores.get(docIdx) ?? 0) + tf * idf)
      }
    }

    const ranked = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)

    const hits: SearchHit[] = []
    for (const [docIdx, score] of ranked) {
      const doc = this.docs[docIdx]
      const snippet = makeSnippet(doc.text, terms)
      hits.push({
        sessionId: doc.sessionId,
        agentName: doc.agentName,
        score,
        field: doc.field,
        snippet,
        highlightedHtml: highlightSnippet(snippet, terms),
      })
    }
    return hits
  }
}

function makeSnippet(text: string, terms: string[], radius = 48): string {
  const lower = text.toLowerCase()
  let best = -1
  for (const term of terms) {
    const idx = lower.indexOf(term)
    if (idx >= 0 && (best < 0 || idx < best)) best = idx
  }
  if (best < 0) {
    return text.length > radius * 2 ? `${text.slice(0, radius * 2)}…` : text
  }
  const start = Math.max(0, best - radius)
  const end = Math.min(text.length, best + radius)
  const prefix = start > 0 ? "…" : ""
  const suffix = end < text.length ? "…" : ""
  return `${prefix}${text.slice(start, end)}${suffix}`
}

export function highlightSnippet(snippet: string, terms: string[]): string {
  if (terms.length === 0) return escapeHtml(snippet)
  const pattern = new RegExp(
    `(${terms.map((t) => escapeRegExp(t)).join("|")})`,
    "gi"
  )
  const parts = snippet.split(pattern)
  return parts
    .map((part) => {
      const isHit = terms.some((t) => part.toLowerCase() === t.toLowerCase())
      if (isHit) {
        return `<mark class="search-hit">${escapeHtml(part)}</mark>`
      }
      return escapeHtml(part)
    })
    .join("")
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function createSessionSearch(sessions: AgentSession[]): SessionSearchIndex {
  const docs = buildSessionDocuments(sessions)
  const index = new SessionSearchIndex(docs)
  index.build()
  return index
}