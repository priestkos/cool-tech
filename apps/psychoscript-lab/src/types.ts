export type ToolCallLogEntry = {
  key: string
  name: string
  args: unknown
  result?: unknown
  error?: { kind: string; message: string }
  durationMs: number
  startedAt: number
}

export type RunResultPayload = {
  ok: boolean
  value?: unknown
  error?: { kind: string; message: string; suggestions?: string[] }
  logs?: string[]
  warnings?: Array<{ kind: string; message: string }>
  toolCalls: ToolCallLogEntry[]
  processLabel: string
  pid: number
}

export type PresetId = "chain" | "loop" | "host-error" | "long-pause" | "suspend-blocked"