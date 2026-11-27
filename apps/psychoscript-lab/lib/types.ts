import type { Json } from "psychoscript"

export type WeatherProfile = "sunny" | "rainy"

export type ToolCallLogEntry = {
  key: string
  name: string
  args: Json
  result?: Json
  error?: { kind: string; message: string }
  durationMs: number
  startedAt: number
}

export type RunResultPayload = {
  ok: boolean
  value?: Json
  error?: { kind: string; message: string; suggestions?: string[] }
  logs?: string[]
  warnings?: Array<{ kind: string; message: string }>
  toolCalls: ToolCallLogEntry[]
  processLabel: string
  pid: number
}

export type PresetId =
  | "chain"
  | "loop"
  | "host-error"
  | "long-pause"
  | "suspend-blocked"

export type EscapeProbeId =
  | "fetch"
  | "require"
  | "import"
  | "process"
  | "setTimeout"
  | "globalThis"
  | "eval"