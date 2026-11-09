export type SwarmPhase =
  | "idle"
  | "enter"
  | "frame"
  | "scan"
  | "type"
  | "exit"
  | "complete"

export type TriggerMode = "mount" | "visible" | "manual"

export type SwarmRuntimeState = {
  phase: SwarmPhase
  runId: number
  /** 0–1 within current phase */
  phaseProgress: number
  /** 0–1 typing reveal */
  typeProgress: number
  frameProgress: number
  scanProgress: number
  playing: boolean
}

export const PHASE_ORDER: SwarmPhase[] = [
  "idle",
  "enter",
  "frame",
  "scan",
  "type",
  "exit",
  "complete",
]

export const DEFAULT_AGENT_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ec4899",
] as const
