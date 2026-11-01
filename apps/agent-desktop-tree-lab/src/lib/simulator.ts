import {
  ENVELOPE_VERSION,
  type Disposition,
  type Envelope,
  type ErrorEnvelope,
  type ParsedCommand,
  type RefMapEntry,
  type SnapshotData,
  type SuccessEnvelope,
} from "./types"
import type { JotterState } from "./jotter-model"
import {
  createNote,
  deleteSelectedNote,
  selectedNote,
  visibleNotes,
} from "./jotter-model"
import {
  buildSnapshotTree,
  findInTree,
  stripInternalKeys,
} from "./tree-builder"

const QUALIFIED_REF = /^@(s[a-z0-9]{7,8}):e(\d+)$/i
const BARE_REF = /^@e\d+$/i

export interface SimulatorSnapshot {
  snapshotId: string
  refMap: Map<string, RefMapEntry>
  tree: SnapshotData["tree"]
  envelopeJson: string
}

export interface SimulatorContext {
  appState: JotterState
  snapshotCounter: number
  snapshots: Map<string, SimulatorSnapshot>
  /** Snapshot ids invalidated after UI mutations */
  staleSnapshotIds: Set<string>
  lastSnapshotId: string | null
}

export function createSimulatorContext(
  initial: JotterState,
): SimulatorContext {
  return {
    appState: structuredClone(initial),
    snapshotCounter: 0,
    snapshots: new Map(),
    staleSnapshotIds: new Set(),
    lastSnapshotId: null,
  }
}

export function resetSimulatorContext(
  ctx: SimulatorContext,
  initial: JotterState,
): void {
  ctx.appState = structuredClone(initial)
  ctx.snapshotCounter = 0
  ctx.snapshots.clear()
  ctx.staleSnapshotIds.clear()
  ctx.lastSnapshotId = null
}

function success<T>(command: string, data: T): SuccessEnvelope<T> {
  return {
    version: ENVELOPE_VERSION,
    ok: true,
    command,
    data,
  }
}

function fail(
  command: string,
  code: string,
  message: string,
  suggestion: string | undefined,
  disposition: Disposition,
  recovery?: ErrorEnvelope["error"]["recovery"],
): ErrorEnvelope {
  return {
    version: ENVELOPE_VERSION,
    ok: false,
    command,
    error: {
      code,
      message,
      suggestion,
      recovery,
      disposition,
    },
  }
}

export function minifyEnvelope(envelope: Envelope): string {
  return JSON.stringify(envelope)
}

function invalidateSnapshots(ctx: SimulatorContext): void {
  for (const id of ctx.snapshots.keys()) {
    ctx.staleSnapshotIds.add(id)
  }
}

function parseFlags(tokens: string[]): {
  flags: Record<string, string | boolean>
  rest: string[]
} {
  const flags: Record<string, string | boolean> = {}
  const rest: string[] = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t === "-i") {
      flags.i = true
      continue
    }
    if (t.startsWith("--")) {
      const key = t.slice(2)
      const next = tokens[i + 1]
      if (next && !next.startsWith("-")) {
        flags[key] = next
        i++
      } else {
        flags[key] = true
      }
      continue
    }
    if (t.startsWith("-") && t.length === 2) {
      flags[t.slice(1)] = true
      continue
    }
    rest.push(t)
  }
  return { flags, rest }
}

export function parseCommandLine(line: string): ParsedCommand | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  let body = trimmed
  if (body.startsWith("agent-desktop ")) {
    body = body.slice("agent-desktop ".length)
  }
  let agentId: string | undefined
  const agentMatch = body.match(/^\[agent:([^\]]+)\]\s*/)
  if (agentMatch) {
    agentId = agentMatch[1]
    body = body.slice(agentMatch[0].length)
  }
  const tokens = body.match(/(?:[^\s"]+|"[^"]*")+/g) ?? []
  const cleaned = tokens.map((t) =>
    t.startsWith('"') && t.endsWith('"') ? t.slice(1, -1) : t,
  )
  if (!cleaned.length) return null
  const command = cleaned[0]
  const { flags, rest } = parseFlags(cleaned.slice(1))
  return { raw: trimmed, command, args: rest, flags, agentId }
}

const SUPPORTED = new Set([
  "snapshot",
  "click",
  "type",
  "set-value",
  "get",
  "find",
])

export function dispatchCommand(
  ctx: SimulatorContext,
  parsed: ParsedCommand,
): Envelope {
  if (!SUPPORTED.has(parsed.command)) {
    return fail(
      parsed.command,
      "INTERNAL",
      `Command "${parsed.command}" is not simulated in this demo.`,
      "Use snapshot, click, type, set-value, get, or find in mock mode.",
      { delivery: "not_delivered", retry: "unsafe" },
    )
  }
  switch (parsed.command) {
    case "snapshot":
      return runSnapshot(ctx, parsed)
    case "click":
      return runClick(ctx, parsed)
    case "type":
      return runType(ctx, parsed)
    case "set-value":
      return runSetValue(ctx, parsed)
    case "get":
      return runGet(ctx, parsed)
    case "find":
      return runFind(ctx, parsed)
  }
  return fail(
    parsed.command,
    "INTERNAL",
    `Command "${parsed.command}" is not simulated in this demo.`,
    "Use snapshot, click, type, set-value, get, or find in mock mode.",
    { delivery: "not_delivered", retry: "unsafe" },
  )
}

function runSnapshot(ctx: SimulatorContext, parsed: ParsedCommand): Envelope {
  const appFlag = parsed.flags.app
  const appName =
    typeof appFlag === "string" ? appFlag : parsed.args[0] ?? "Jotter"
  if (appName !== "Jotter") {
    return fail(
      "snapshot",
      "APP_NOT_FOUND",
      `Application "${appName}" is not open in this mock lab.`,
      "Use --app Jotter for the simulated notes app.",
      { delivery: "not_delivered", retry: "safe" },
    )
  }
  ctx.snapshotCounter += 1
  const built = buildSnapshotTree(ctx.appState, ctx.snapshotCounter, {
    interactiveOnly: Boolean(parsed.flags.i),
    compact: Boolean(parsed.flags.compact),
  })
  const data: SnapshotData = {
    app: "Jotter",
    window: { id: "w-jotter-1", title: "Jotter" },
    snapshot_id: built.snapshotId,
    ref_count: built.refCount,
    complete: true,
    tree: stripInternalKeys(built.tree),
  }
  const envelope = success("snapshot", data)
  const envelopeJson = minifyEnvelope(envelope)
  ctx.snapshots.set(built.snapshotId, {
    snapshotId: built.snapshotId,
    refMap: built.refMap,
    tree: data.tree,
    envelopeJson,
  })
  ctx.lastSnapshotId = built.snapshotId
  return envelope
}

function isResolvedRef(
  result: { entry: RefMapEntry; snapshotId: string } | ErrorEnvelope,
): result is { entry: RefMapEntry; snapshotId: string } {
  return "entry" in result
}

function resolveRef(
  ctx: SimulatorContext,
  ref: string,
  command: string,
): { entry: RefMapEntry; snapshotId: string } | ErrorEnvelope {
  if (BARE_REF.test(ref)) {
    return fail(
      command,
      "INVALID_ARGS",
      `Ref "${ref}" must include a snapshot id (e.g. @s1a2b3c4:e5).`,
      "Run snapshot to obtain qualified refs, then pass the full @<snapshot_id>:e<N> string.",
      { delivery: "not_delivered", retry: "unsafe" },
    )
  }
  const m = ref.match(QUALIFIED_REF)
  if (!m) {
    return fail(
      command,
      "INVALID_ARGS",
      `Ref "${ref}" is not a valid qualified ref.`,
      "Use refs printed by snapshot, formatted as @<snapshot_id>:e<N>.",
      { delivery: "not_delivered", retry: "unsafe" },
    )
  }
  const snapshotId = m[1]
  const fullId = `@${snapshotId}:e${m[2]}`
  if (!ctx.snapshots.has(snapshotId)) {
    return fail(
      command,
      "SNAPSHOT_NOT_FOUND",
      `Snapshot "${snapshotId}" is missing or expired in this mock session.`,
      "Run snapshot to create a fresh snapshot_id.",
      { delivery: "not_delivered", retry: "safe" },
    )
  }
  if (ctx.staleSnapshotIds.has(snapshotId)) {
    return fail(
      command,
      "STALE_REF",
      `${fullId} not found in current RefMap`,
      "Re-run a snapshot to obtain fresh refs, then retry with the new ref (CLI: snapshot [--skeleton]; FFI: ad_snapshot then pass the printed qualified ref to ad_execute_by_ref)",
      { delivery: "not_delivered", retry: "safe" },
      {
        strategy: "refresh_snapshot_then_retry_original",
        retryable: true,
        requires_fresh_snapshot: true,
      },
    )
  }
  const snap = ctx.snapshots.get(snapshotId)!
  const entry = snap.refMap.get(fullId)
  if (!entry) {
    return fail(
      command,
      "ELEMENT_NOT_FOUND",
      `${fullId} does not exist in snapshot ${snapshotId}.`,
      "Pick a ref from the latest snapshot tree or run find.",
      { delivery: "not_delivered", retry: "safe" },
    )
  }
  return { entry, snapshotId }
}

function runClick(ctx: SimulatorContext, parsed: ParsedCommand): Envelope {
  const ref = parsed.args[0]
  if (!ref) {
    return fail(
      "click",
      "INVALID_ARGS",
      "click requires a qualified ref argument.",
      "Example: agent-desktop click @s1a2b3c4:e5",
      { delivery: "not_delivered", retry: "unsafe" },
    )
  }
  const resolved = resolveRef(ctx, ref, "click")
  if (!isResolvedRef(resolved)) return resolved
  const { entry } = resolved
  invalidateSnapshots(ctx)
  applyClick(ctx, entry.elementKey)
  return success("click", {
    action: "click",
    disposition: { delivery: "delivered_unverified", retry: "unsafe" },
  })
}

function applyClick(ctx: SimulatorContext, elementKey: string): void {
  const state = ctx.appState
  if (elementKey.startsWith("folder-")) {
    const id = elementKey.replace("folder-", "")
    ctx.appState = { ...state, selectedFolderId: id, selectedNoteId: visibleNotes({ ...state, selectedFolderId: id })[0]?.id ?? null }
    return
  }
  if (elementKey.startsWith("note-")) {
    const id = elementKey.replace("note-", "")
    ctx.appState = { ...state, selectedNoteId: id }
    return
  }
  switch (elementKey) {
    case "btn-new":
      ctx.appState = createNote(state)
      break
    case "btn-delete":
      ctx.appState = deleteSelectedNote(state)
      break
    case "btn-share":
      break
    case "checkbox-pin": {
      const note = selectedNote(state)
      if (!note) break
      ctx.appState = {
        ...state,
        notes: state.notes.map((n) =>
          n.id === note.id ? { ...n, pinned: !n.pinned } : n,
        ),
      }
      break
    }
    default:
      break
  }
}

function runType(ctx: SimulatorContext, parsed: ParsedCommand): Envelope {
  const ref = parsed.args[0]
  const text = parsed.args[1] ?? ""
  if (!ref) {
    return fail(
      "type",
      "INVALID_ARGS",
      "type requires a ref and text.",
      'Example: agent-desktop type @s1a2b3c4:e7 "Groceries"',
      { delivery: "not_delivered", retry: "unsafe" },
    )
  }
  const resolved = resolveRef(ctx, ref, "type")
  if (!isResolvedRef(resolved)) return resolved
  invalidateSnapshots(ctx)
  applyText(ctx, resolved.entry.elementKey, text, "append")
  return success("type", {
    action: "type",
    disposition: { delivery: "delivered_unverified", retry: "unsafe" },
  })
}

function runSetValue(ctx: SimulatorContext, parsed: ParsedCommand): Envelope {
  const ref = parsed.args[0]
  const value = parsed.args[1] ?? ""
  if (!ref) {
    return fail(
      "set-value",
      "INVALID_ARGS",
      "set-value requires a ref and value.",
      "Example: agent-desktop set-value @s1a2b3c4:e7 Groceries",
      { delivery: "not_delivered", retry: "unsafe" },
    )
  }
  const resolved = resolveRef(ctx, ref, "set-value")
  if (!isResolvedRef(resolved)) return resolved
  invalidateSnapshots(ctx)
  applyText(ctx, resolved.entry.elementKey, value, "replace")
  return success("set-value", {
    action: "set-value",
    disposition: { delivery: "delivered_unverified", retry: "unsafe" },
  })
}

function applyText(
  ctx: SimulatorContext,
  elementKey: string,
  text: string,
  mode: "append" | "replace",
): void {
  const state = ctx.appState
  const note = selectedNote(state)
  if (elementKey === "field-search") {
    ctx.appState = { ...state, searchQuery: mode === "replace" ? text : state.searchQuery + text }
    return
  }
  if (!note) return
  if (elementKey === "field-title") {
    ctx.appState = {
      ...state,
      notes: state.notes.map((n) =>
        n.id === note.id
          ? { ...n, title: mode === "replace" ? text : n.title + text }
          : n,
      ),
    }
  }
  if (elementKey === "field-body") {
    ctx.appState = {
      ...state,
      notes: state.notes.map((n) =>
        n.id === note.id
          ? { ...n, body: mode === "replace" ? text : n.body + text }
          : n,
      ),
    }
  }
}

function runGet(ctx: SimulatorContext, parsed: ParsedCommand): Envelope {
  const ref = parsed.args[0]
  const propFlag = parsed.flags.property
  const property = typeof propFlag === "string" ? propFlag : "name"
  if (!ref) {
    return fail(
      "get",
      "INVALID_ARGS",
      "get requires a ref.",
      "Example: agent-desktop get @s1a2b3c4:e5 --property name",
      { delivery: "not_delivered", retry: "unsafe" },
    )
  }
  const resolved = resolveRef(ctx, ref, "get")
  if (!isResolvedRef(resolved)) return resolved
  const { entry } = resolved
  const value =
    property === "role"
      ? entry.role
      : property === "name"
        ? entry.name
        : entry.name
  return success("get", {
    ref_id: ref,
    property,
    value,
  })
}

function runFind(ctx: SimulatorContext, parsed: ParsedCommand): Envelope {
  ctx.snapshotCounter += 1
  const built = buildSnapshotTree(ctx.appState, ctx.snapshotCounter, {
    interactiveOnly: false,
    compact: false,
  })
  const roleFlag = parsed.flags.role
  const nameFlag = parsed.flags.name
  const role = typeof roleFlag === "string" ? roleFlag : undefined
  const name = typeof nameFlag === "string" ? nameFlag : undefined
  const exact = Boolean(parsed.flags.exact)
  const matches = findInTree(built.tree, role, name, exact).map((n) => ({
    ref_id: n.ref_id,
    role: n.role,
    name: n.name,
    states: n.states,
  }))
  return success("find", {
    snapshot_id: built.snapshotId,
    matches,
  })
}

export function formatCliLine(parsed: ParsedCommand): string {
  const prefix = parsed.agentId ? `[agent:${parsed.agentId}] ` : ""
  const parts = [parsed.command]
  for (const [k, v] of Object.entries(parsed.flags)) {
    if (v === true) {
      if (k.length === 1) parts.unshift(`-${k}`)
      else parts.push(`--${k}`)
    } else if (typeof v === "string") {
      parts.push(`--${k}`, v)
    }
  }
  parts.push(...parsed.args)
  return `${prefix}agent-desktop ${parts.join(" ")}`
}

export function elementKeyForRef(
  ctx: SimulatorContext,
  ref: string,
): string | null {
  const m = ref.match(/^@(s[a-z0-9]{7,8}):e(\d+)$/i)
  if (!m) return null
  const snap = ctx.snapshots.get(m[1])
  return snap?.refMap.get(ref)?.elementKey ?? null
}
