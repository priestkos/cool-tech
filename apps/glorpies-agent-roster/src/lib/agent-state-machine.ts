import type { FaceState } from "glorpies"
import { isState, seedOf } from "glorpies"

export type RosterAgent = {
  id: string
  name: string
  role: string
  task: string
}

export function coerceState(value: unknown): FaceState {
  if (isState(value)) return value
  return "idle"
}

/** Deterministic unit interval from an integer seed. */
export function seededUnit(seed: number): number {
  let t = seed >>> 0
  t += 0x6d2b79f5
  let x = Math.imul(t ^ (t >>> 15), t | 1)
  x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296
}

const BASE_SEQUENCE: FaceState[] = ["idle", "thinking", "working"]

export function branchState(agentSeed: number): FaceState {
  return seededUnit(agentSeed + 17) > 0.55 ? "blocked" : "waiting"
}

export function sequenceForAgent(agentSeed: number): FaceState[] {
  return [...BASE_SEQUENCE, branchState(agentSeed), "done"]
}

/** State for one agent at simulation tick `tick` (integer >= 0). */
export function stateAtTick(tick: number, agentIndex: number, agentSeed: number): FaceState {
  const sequence = sequenceForAgent(agentSeed)
  const ticksPerStep = 3 + (agentSeed % 4)
  const offset = agentIndex % sequence.length
  const step = Math.floor((tick + offset) / ticksPerStep) % sequence.length
  return sequence[step] ?? "idle"
}

export function agentSeedFromName(name: string): number {
  return seedOf(name)
}

export function describeTransition(from: FaceState, to: FaceState, agentName: string): string {
  return `${agentName}: ${from} → ${to}`
}
