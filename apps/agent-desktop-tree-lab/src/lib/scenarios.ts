import type { Envelope, SnapshotData } from "./types"
import type { ParsedCommand } from "./types"
import { parseCommandLine } from "./simulator"

export interface ScenarioStep {
  id: string
  label: string
  /** CLI line without agent-desktop prefix */
  command: string
  agentId?: string
  /** If set, click this stale ref from a prior snapshot id key */
  reuseStaleRefFromStep?: string
}

export const MAIN_SCENARIO: ScenarioStep[] = [
  {
    id: "s1",
    label: "Observe the Jotter window",
    command: 'snapshot --app Jotter -i --compact',
  },
  {
    id: "s2",
    label: "Click New (creates a note)",
    command: 'click {{ref:button:New}}',
  },
  {
    id: "s3",
    label: "Reuse stale ref from first snapshot",
    command: 'click {{stale:button:New}}',
    reuseStaleRefFromStep: "s1",
  },
  {
    id: "s4",
    label: "Fresh snapshot after UI change",
    command: 'snapshot --app Jotter -i --compact',
  },
  {
    id: "s5",
    label: "Type note title",
    command: 'type {{ref:field:Note title}} "Groceries list"',
  },
  {
    id: "s6",
    label: "Type note body",
    command: 'type {{ref:field:Note body}} "Add milk and bread."',
  },
  {
    id: "s7",
    label: "Toggle Pin note",
    command: 'click {{ref:checkbox:Pin note}}',
  },
  {
    id: "s8",
    label: "Verify with snapshot",
    command: 'snapshot --app Jotter -i --compact',
  },
]

export const MULTI_AGENT_SCENARIO: ScenarioStep[] = [
  {
    id: "m1",
    label: "Writer observes",
    command: 'snapshot --app Jotter -i --compact',
    agentId: "writer",
  },
  {
    id: "m2",
    label: "Tidier observes",
    command: 'snapshot --app Jotter -i --compact',
    agentId: "tidier",
  },
  {
    id: "m3",
    label: "Writer clicks New",
    command: 'click {{ref:button:New}}',
    agentId: "writer",
  },
  {
    id: "m4",
    label: "Writer fresh snapshot",
    command: 'snapshot --app Jotter -i --compact',
    agentId: "writer",
  },
  {
    id: "m5",
    label: "Tidier fresh snapshot",
    command: 'snapshot --app Jotter -i --compact',
    agentId: "tidier",
  },
  {
    id: "m6",
    label: "Writer sets title",
    command: 'set-value {{ref:field:Note title}} Team retro',
    agentId: "writer",
  },
  {
    id: "m7",
    label: "Tidier pins note",
    command: 'click {{ref:checkbox:Pin note}}',
    agentId: "tidier",
  },
]

export interface StepRefCache {
  byStep: Map<string, Map<string, string>>
}

export function findRefInEnvelope(
  envelope: Envelope,
  kind: string,
  name: string,
): string | null {
  if (!envelope.ok || envelope.command !== "snapshot") return null
  const data = envelope.data as SnapshotData
  const walk = (node: SnapshotData["tree"]): string | null => {
    if (node.ref_id && node.name === name) {
      if (kind === "button" && node.role === "button") return node.ref_id
      if (kind === "checkbox" && node.role === "checkbox") return node.ref_id
      if (kind === "field" && (node.role === "textfield" || node.role === "textarea")) {
        return node.ref_id
      }
    }
    for (const c of node.children ?? []) {
      const found = walk(c)
      if (found) return found
    }
    return null
  }
  return walk(data.tree)
}

export function resolveStepCommand(
  step: ScenarioStep,
  cache: StepRefCache,
  currentSnapshotRef: (kind: string, name: string, agentId?: string) => string | null,
): ParsedCommand | null {
  let cmd = step.command
  cmd = cmd.replace(/\{\{ref:([^:]+):([^}]+)\}\}/g, (_m, kind, name) => {
    const ref = currentSnapshotRef(kind, name.trim(), step.agentId)
    return ref ?? "@s0000000:e0"
  })
  cmd = cmd.replace(/\{\{stale:([^:]+):([^}]+)\}\}/g, (_m, kind, name) => {
    if (!step.reuseStaleRefFromStep) return "@e0"
    const map = cache.byStep.get(step.reuseStaleRefFromStep)
    const key = `${kind}:${name.trim()}`
    return map?.get(key) ?? "@e0"
  })
  const agentPrefix = step.agentId ? `[agent:${step.agentId}] ` : ""
  return parseCommandLine(`${agentPrefix}agent-desktop ${cmd}`)
}

export function cacheRefsFromStep(
  stepId: string,
  envelope: Envelope,
  cache: StepRefCache,
): void {
  if (!envelope.ok || envelope.command !== "snapshot") return
  const data = envelope.data as SnapshotData
  const map = new Map<string, string>()
  const visit = (node: SnapshotData["tree"]) => {
    if (node.ref_id && node.name) {
      if (node.role === "button") map.set(`button:${node.name}`, node.ref_id)
      if (node.role === "checkbox") map.set(`checkbox:${node.name}`, node.ref_id)
      if (node.role === "textfield" || node.role === "textarea") {
        map.set(`field:${node.name}`, node.ref_id)
      }
    }
    for (const c of node.children ?? []) visit(c)
  }
  visit(data.tree)
  cache.byStep.set(stepId, map)
}
