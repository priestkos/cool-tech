import type { AgentSession, OverlapFlag, WorkAttempt } from "@/lib/types"

function normalizeCommand(cmd: string): string {
  return cmd.trim().replace(/\s+/g, " ").toLowerCase()
}

function normalizeError(err: string): string {
  return err.trim().replace(/\s+/g, " ").toLowerCase()
}

function normalizeFile(path: string): string {
  return path.trim().replace(/\\/g, "/").toLowerCase()
}

export function extractWorkAttempts(sessions: AgentSession[]): WorkAttempt[] {
  const attempts: WorkAttempt[] = []
  for (const session of sessions) {
    for (const step of session.steps) {
      if (step.kind === "edit" && step.file) {
        attempts.push({
          id: `${session.id}:${step.id}:file`,
          sessionId: session.id,
          agentId: session.agentId,
          agentName: session.agentName,
          stepId: step.id,
          kind: "file",
          key: normalizeFile(step.file),
          label: `Edit ${step.file}`,
          at: step.at,
        })
      }
      if (step.kind === "command" && step.command) {
        attempts.push({
          id: `${session.id}:${step.id}:command`,
          sessionId: session.id,
          agentId: session.agentId,
          agentName: session.agentName,
          stepId: step.id,
          kind: "command",
          key: normalizeCommand(step.command),
          label: `Run ${step.command}`,
          at: step.at,
        })
      }
      if (step.kind === "error" && step.error) {
        attempts.push({
          id: `${session.id}:${step.id}:error`,
          sessionId: session.id,
          agentId: session.agentId,
          agentName: session.agentName,
          stepId: step.id,
          kind: "error",
          key: normalizeError(step.error),
          label: step.error.slice(0, 80),
          at: step.at,
        })
      }
    }
  }
  return attempts.sort((a, b) => a.at.localeCompare(b.at))
}

export function detectOverlaps(attempts: WorkAttempt[]): OverlapFlag[] {
  const byKey = new Map<string, WorkAttempt[]>()
  for (const a of attempts) {
    const compound = `${a.kind}:${a.key}`
    const list = byKey.get(compound) ?? []
    list.push(a)
    byKey.set(compound, list)
  }

  const flags: OverlapFlag[] = []
  for (const [, list] of byKey) {
    if (list.length < 2) continue
    const sorted = [...list].sort((a, b) => a.at.localeCompare(b.at))
    for (let i = 1; i < sorted.length; i++) {
      const earlier = sorted[0]
      const later = sorted[i]
      if (earlier.agentId === later.agentId) continue
      flags.push({
        id: `overlap-${earlier.id}-${later.id}`,
        kind: earlier.kind,
        key: earlier.key,
        label: earlier.label,
        earlier,
        later,
      })
    }
  }
  return flags.sort((a, b) => a.later.at.localeCompare(b.later.at))
}

export interface TimelineEntry {
  attempt: WorkAttempt
  overlap?: OverlapFlag
}

export function buildOverlapTimeline(
  attempts: WorkAttempt[],
  flags: OverlapFlag[]
): TimelineEntry[] {
  const flagByLaterId = new Map<string, OverlapFlag>()
  for (const f of flags) {
    flagByLaterId.set(f.later.id, f)
  }
  return attempts.map((attempt) => ({
    attempt,
    overlap: flagByLaterId.get(attempt.id),
  }))
}