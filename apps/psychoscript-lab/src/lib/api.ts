import type { PresetId, RunResultPayload, ToolCallLogEntry } from "@/types.ts"

const api = (path: string, init?: RequestInit) => fetch(path, init).then((r) => r.json())

export async function runPreset(presetId: PresetId) {
  return api("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ presetId }),
  }) as Promise<RunResultPayload>
}

export async function runCode(code: string) {
  return api("/api/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  }) as Promise<RunResultPayload>
}

export async function startPauseSession(presetId: PresetId = "long-pause") {
  return api("/api/session/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ presetId }),
  }) as Promise<{ sessionId: string; processLabel: string; pid: number }>
}

export async function suspendSession(sessionId: string) {
  return api("/api/session/suspend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  }) as Promise<
    | { suspended: true; byteLength: number; bytesBase64: string }
    | { suspended: false; outcome: unknown }
  >
}

export async function resumeSnapshot(bytesBase64: string) {
  return api("/api/resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bytesBase64 }),
  }) as Promise<RunResultPayload>
}

export async function resumeChild(bytesBase64: string) {
  return api("/api/resume-child", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bytesBase64 }),
  }) as Promise<RunResultPayload>
}

export async function forkSnapshot(bytesBase64: string) {
  return api("/api/fork", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bytesBase64, leftProfile: "sunny", rightProfile: "rainy" }),
  }) as Promise<{ left: RunResultPayload; right: RunResultPayload }>
}

export async function corruptProbe(bytesBase64: string) {
  return api("/api/snapshot/corrupt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bytesBase64 }),
  }) as Promise<{ ok: boolean; name?: string; message?: string }>
}

export async function suspendBlockedDemo() {
  return api("/api/demo/suspend-blocked", { method: "POST" }) as Promise<{
    rejected: boolean
    name?: string
    message?: string
    running?: Array<{ key: string; path: string }>
  }>
}

export async function runEscapePanel() {
  return api("/api/escape", { method: "POST" }) as Promise<{
    probes: Array<{ id: string; label: string; ok: boolean; error?: string; value?: unknown }>
  }>
}

export type { ToolCallLogEntry }