import { createInitialLabState } from "@/lib/board"
import type { LabState } from "@/lib/types"

export const STORAGE_KEY = "opencrawl-board-lab-state-v1"

export function serializeLabState(state: LabState): string {
  return JSON.stringify(state)
}

export function parseLabState(json: string): LabState {
  const raw = JSON.parse(json) as LabState
  if (raw.version !== 1) {
    throw new Error("Unsupported lab state version")
  }
  if (!Array.isArray(raw.posts) || !Array.isArray(raw.inbox)) {
    throw new Error("Invalid lab state shape")
  }
  return raw
}

export function loadLabState(): LabState | null {
  if (typeof localStorage === "undefined") return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return parseLabState(raw)
  } catch {
    return null
  }
}

export function saveLabState(state: LabState): void {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(STORAGE_KEY, serializeLabState(state))
}

export function hydrateLabState(): LabState {
  return loadLabState() ?? createInitialLabState()
}

export function roundTripLabState(state: LabState): LabState {
  return parseLabState(serializeLabState(state))
}