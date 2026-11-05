import type { FaceState, LookChoice, Shape } from "glorpies"
import { isLook, isShape } from "glorpies"
import type { RosterAgent } from "./agent-state-machine"
import { coerceState } from "./agent-state-machine"
import type { SeedMode } from "./seed-input"

export const STORAGE_KEY = "glorpies-agent-roster:v1"

export type ExplorerState = {
  rawInput: string
  seedMode: SeedMode
  look: LookChoice
  shape: Shape
  background: boolean | string
}

export type PersistedAppState = {
  v: 1
  simulate: boolean
  tick: number
  agents: RosterAgent[]
  pinned: Record<string, FaceState>
  explorer: ExplorerState
}

export const DEFAULT_AGENTS: RosterAgent[] = [
  { id: "a1", name: "relay-bot", role: "Router", task: "Triage incoming prompts" },
  { id: "a2", name: "soggy-glorp", role: "Research", task: "Summarize docs offline" },
  { id: "a3", name: "patch-9", role: "Coder", task: "Apply small diffs safely" },
  { id: "a4", name: "lint-owl", role: "Reviewer", task: "Run static checks" },
  { id: "a5", name: "vault-keeper", role: "Security", task: "Scan for secrets" },
  { id: "a6", name: "chart-moth", role: "Analyst", task: "Plot metrics locally" },
  { id: "a7", name: "echo-node", role: "Support", task: "Draft user replies" },
]

export const DEFAULT_EXPLORER: ExplorerState = {
  rawInput: "agent-47",
  seedMode: "string",
  look: "auto",
  shape: "circle",
  background: true,
}

export function defaultAppState(): PersistedAppState {
  return {
    v: 1,
    simulate: false,
    tick: 0,
    agents: DEFAULT_AGENTS,
    pinned: {},
    explorer: DEFAULT_EXPLORER,
  }
}

function sanitizeExplorer(raw: unknown): ExplorerState {
  const base = DEFAULT_EXPLORER
  if (!raw || typeof raw !== "object") return base
  const e = raw as Record<string, unknown>
  const seedMode = e.seedMode === "number" ? "number" : "string"
  const look = isLook(e.look) || e.look === "auto" ? (e.look as LookChoice) : base.look
  const shape = isShape(e.shape) ? e.shape : base.shape
  let background: boolean | string = base.background
  if (typeof e.background === "boolean") background = e.background
  else if (typeof e.background === "string") background = e.background
  const rawInput = typeof e.rawInput === "string" ? e.rawInput : base.rawInput
  return { rawInput, seedMode, look, shape, background }
}

function sanitizeAgents(raw: unknown): RosterAgent[] {
  if (!Array.isArray(raw)) return DEFAULT_AGENTS
  const agents: RosterAgent[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const row = item as Record<string, unknown>
    if (typeof row.id !== "string") continue
    if (typeof row.name !== "string") continue
    agents.push({
      id: row.id,
      role: typeof row.role === "string" ? row.role : "Agent",
      task: typeof row.task === "string" ? row.task : "Idle",
      name: row.name,
    })
  }
  return agents.length > 0 ? agents : DEFAULT_AGENTS
}

function sanitizePinned(raw: unknown): Record<string, FaceState> {
  if (!raw || typeof raw !== "object") return {}
  const out: Record<string, FaceState> = {}
  for (const [id, state] of Object.entries(raw as Record<string, unknown>)) {
    out[id] = coerceState(state)
  }
  return out
}

export function parsePersistedJson(text: string | null | undefined): PersistedAppState | null {
  if (!text) return null
  try {
    const parsed = JSON.parse(text) as unknown
    if (!parsed || typeof parsed !== "object") return null
    const obj = parsed as Record<string, unknown>
    if (obj.v !== 1) return null
    return {
      v: 1,
      simulate: Boolean(obj.simulate),
      tick: typeof obj.tick === "number" && Number.isFinite(obj.tick) ? Math.max(0, obj.tick) : 0,
      agents: sanitizeAgents(obj.agents),
      pinned: sanitizePinned(obj.pinned),
      explorer: sanitizeExplorer(obj.explorer),
    }
  } catch {
    return null
  }
}

export function serializeAppState(state: PersistedAppState): string {
  return JSON.stringify(state)
}

export function readHashState(): PersistedAppState | null {
  if (typeof window === "undefined") return null
  const hash = window.location.hash.replace(/^#/, "")
  if (!hash) return null
  try {
    const decoded = decodeURIComponent(hash)
    return parsePersistedJson(decoded)
  } catch {
    return parsePersistedJson(hash)
  }
}

export function writeHashState(state: PersistedAppState): void {
  if (typeof window === "undefined") return
  const encoded = encodeURIComponent(serializeAppState(state))
  const next = `#${encoded}`
  if (window.location.hash !== next) {
    window.history.replaceState(null, "", next)
  }
}

export function readLocalState(): PersistedAppState | null {
  if (typeof window === "undefined") return null
  try {
    return parsePersistedJson(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

export function writeLocalState(state: PersistedAppState): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, serializeAppState(state))
  } catch {
    /* quota or private mode */
  }
}

export function loadInitialState(): PersistedAppState {
  return readHashState() ?? readLocalState() ?? defaultAppState()
}

export function mergePersisted(
  current: PersistedAppState,
  patch: Partial<PersistedAppState>,
): PersistedAppState {
  return {
    ...current,
    ...patch,
    explorer: patch.explorer ? { ...current.explorer, ...patch.explorer } : current.explorer,
    agents: patch.agents ?? current.agents,
    pinned: patch.pinned ?? current.pinned,
  }
}
