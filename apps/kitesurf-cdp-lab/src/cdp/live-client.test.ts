import { describe, expect, test } from "bun:test"
import {
  CdpLiveClient,
  WS_CLOSED,
  connectionFailureState,
  type WebSocketLike,
} from "./live-client"

class MockFailingSocket implements WebSocketLike {
  readyState = WS_CLOSED
  onopen = null
  onmessage = null
  onerror = null
  onclose = null
  send() {
    /* noop */
  }
  close() {
    /* noop */
  }
  constructor() {
    queueMicrotask(() => this.onerror?.(new Event("error")))
  }
}

describe("CdpLiveClient connection failure", () => {
  test("fails gracefully when socket errors", async () => {
    const client = new CdpLiveClient({
      url: "ws://127.0.0.1:8787",
      createSocket: () => new MockFailingSocket(),
      connectTimeoutMs: 500,
    })
    await expect(client.connect()).rejects.toThrow(/failed|timed out/i)
    const st = connectionFailureState(new Error("WebSocket connection failed"))
    expect(st.state).toBe("failed")
    expect(st.message.length).toBeGreaterThan(0)
  })
})