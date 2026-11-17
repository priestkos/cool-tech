import rawSessions from "@/fixtures/sessions.json"
import type { AgentSession, SessionStep, StepKind } from "@/lib/types"

const STEP_KINDS: StepKind[] = ["read", "edit", "command", "note", "error"]

function isStepKind(v: string): v is StepKind {
  return (STEP_KINDS as string[]).includes(v)
}

export function parseSession(raw: unknown): AgentSession {
  if (!raw || typeof raw !== "object") {
    throw new Error("Session must be an object")
  }
  const o = raw as Record<string, unknown>
  const stepsRaw = o.steps
  if (!Array.isArray(stepsRaw)) {
    throw new Error("Session steps must be an array")
  }
  const steps: SessionStep[] = stepsRaw.map((step, i) => parseStep(step, i))
  return {
    id: String(o.id ?? ""),
    agentId: String(o.agentId ?? ""),
    agentName: String(o.agentName ?? ""),
    agentStyle: o.agentStyle === "codex" ? "codex" : "claude-code",
    repo: String(o.repo ?? ""),
    startedAt: String(o.startedAt ?? ""),
    summary: String(o.summary ?? ""),
    steps,
    memoryFiles: Array.isArray(o.memoryFiles)
      ? o.memoryFiles.map((m) => {
          const f = m as Record<string, unknown>
          return { path: String(f.path ?? ""), content: String(f.content ?? "") }
        })
      : undefined,
  }
}

function parseStep(raw: unknown, index: number): SessionStep {
  if (!raw || typeof raw !== "object") {
    throw new Error(`Step ${index} invalid`)
  }
  const s = raw as Record<string, unknown>
  const kind = String(s.kind ?? "")
  if (!isStepKind(kind)) {
    throw new Error(`Step ${index} has invalid kind: ${kind}`)
  }
  return {
    id: String(s.id ?? `step-${index}`),
    kind,
    at: String(s.at ?? ""),
    file: s.file != null ? String(s.file) : undefined,
    command: s.command != null ? String(s.command) : undefined,
    error: s.error != null ? String(s.error) : undefined,
    body: String(s.body ?? ""),
  }
}

export function loadFixtureSessions(): AgentSession[] {
  return (rawSessions as unknown[]).map((s) => parseSession(s))
}

export function sessionStepCount(session: AgentSession): number {
  return session.steps.length
}