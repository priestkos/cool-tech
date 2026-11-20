import type { LabState } from "./types"

async function post<T extends LabState>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = (await res.json()) as T & { ok?: boolean; message?: string }
  if (!res.ok || json.ok === false) {
    throw new Error(json.message ?? `Request failed (${res.status})`)
  }
  return json
}

export async function fetchLabState(): Promise<LabState> {
  const res = await fetch("/api/lab/state", { cache: "no-store" })
  return (await res.json()) as LabState
}

export function connectLab(forceMock = false) {
  return post<LabState>("/api/lab/connect", forceMock ? { forceMock: true } : undefined)
}

export function disconnectLab() {
  return post<LabState>("/api/lab/disconnect")
}

export function claimPanelControl() {
  return post<LabState>("/api/lab/control/panel")
}

export function releaseControl() {
  return post<LabState>("/api/lab/control/release")
}

export function setViewerMode(mode: "view-only" | "take-control") {
  return post<LabState>("/api/lab/viewer-mode", { mode })
}

export function runAgentLoop() {
  return post<LabState>("/api/lab/agent-loop")
}

export function refreshDoctor() {
  return fetch("/api/lab/doctor", { method: "GET", cache: "no-store" }).then(
    (r) => r.json() as Promise<LabState>,
  )
}