export type JsonRpcRequest = {
  id: number
  method: string
  params?: Record<string, unknown>
}

export type JsonRpcResponse = {
  id: number
  result?: unknown
  error?: { code: number; message: string }
}

export type CdpEvent = {
  method: string
  params?: Record<string, unknown>
}

export type CdpPayload = JsonRpcRequest | JsonRpcResponse | CdpEvent

export type TranscriptDirection = "request" | "response" | "event"

export type TranscriptEntry = {
  atMs: number
  direction: TranscriptDirection
  payload: CdpPayload
}

export type ConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "failed"

export type DomNode = {
  nodeId: number
  parentId?: number
  nodeName: string
  nodeValue?: string
  children?: DomNode[]
  attributes?: string[]
  localName?: string
}

export type ConsoleLine = {
  atMs: number
  type: string
  text: string
  argsPreview: string[]
}