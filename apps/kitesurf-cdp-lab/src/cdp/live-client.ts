import type { ConnectionState, JsonRpcRequest, JsonRpcResponse } from "./types"

export type WebSocketLike = {
  readyState: number
  send(data: string): void
  close(): void
  onopen: ((ev: Event) => void) | null
  onmessage: ((ev: { data: string }) => void) | null
  onerror: ((ev: Event) => void) | null
  onclose: ((ev: { code?: number }) => void) | null
}

export const WS_CONNECTING = 0
export const WS_OPEN = 1
export const WS_CLOSING = 2
export const WS_CLOSED = 3

export type CdpLiveClientOptions = {
  url: string
  createSocket?: (url: string) => WebSocketLike
  connectTimeoutMs?: number
}

export class CdpLiveClient {
  readonly url: string
  private socket: WebSocketLike | null = null
  private createSocket: (url: string) => WebSocketLike
  private connectTimeoutMs: number
  private nextId = 1
  state: ConnectionState = "disconnected"
  lastError: string | null = null

  constructor(options: CdpLiveClientOptions) {
    this.url = options.url
    this.createSocket =
      options.createSocket ??
      ((url) => new WebSocket(url) as unknown as WebSocketLike)
    this.connectTimeoutMs = options.connectTimeoutMs ?? 2500
  }

  connect(): Promise<void> {
    if (this.state === "connected" && this.socket?.readyState === WS_OPEN) {
      return Promise.resolve()
    }
    this.state = "connecting"
    this.lastError = null

    return new Promise((resolve, reject) => {
      let settled = false
      const socket = this.createSocket(this.url)
      this.socket = socket

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true
          this.state = "failed"
          this.lastError = "Connection timed out — is Kitesurf running on 127.0.0.1:8787?"
          try {
            socket.close()
          } catch {
            /* noop */
          }
          reject(new Error(this.lastError))
        }
      }, this.connectTimeoutMs)

      socket.onopen = () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        this.state = "connected"
        resolve()
      }

      socket.onerror = () => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        this.state = "failed"
        this.lastError = "WebSocket connection failed"
        reject(new Error(this.lastError))
      }

      socket.onclose = () => {
        if (this.state === "connected") this.state = "disconnected"
      }
    })
  }

  disconnect() {
    this.socket?.close()
    this.socket = null
    this.state = "disconnected"
  }

  sendRequest(method: string, params?: Record<string, unknown>): number {
    if (!this.socket || this.socket.readyState !== WS_OPEN) {
      throw new Error("Not connected")
    }
    const id = this.nextId++
    const frame: JsonRpcRequest = { id, method, params }
    this.socket.send(JSON.stringify(frame))
    return id
  }

  handleMessage(raw: string): JsonRpcResponse | null {
    const parsed = JSON.parse(raw) as JsonRpcResponse
    if ("id" in parsed && ("result" in parsed || "error" in parsed)) {
      return parsed
    }
    return null
  }
}

export function connectionFailureState(err: unknown): {
  state: ConnectionState
  message: string
} {
  const message = err instanceof Error ? err.message : "Connection failed"
  return { state: "failed", message }
}