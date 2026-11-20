export type SessionMode = "disconnected" | "live" | "mock"

export type LabState = {
  ok?: boolean
  mode: SessionMode
  engineUrl: string
  controlHolder: "panel" | "viewer" | null
  viewerMode: "view-only" | "take-control"
  capabilities: Record<string, unknown> | null
  status: Record<string, unknown> | null
  doctor: unknown
  mock: {
    frameIndex: number
    clicks: number
    typed: string
    inputs: Array<{ at: string; kind: string; detail: string }>
  } | null
  lastAgentLoop: {
    startedAt: string
    finishedAt: string
    steps: Array<{
      at: string
      action: string
      beforeThumbB64: string
      afterThumbB64: string | null
    }>
  } | null
}