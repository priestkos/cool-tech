import { describe, expect, test } from "bun:test"
import {
  CdpLiveClient,
  WS_CLOSED,
  WS_CONNECTING,
  WS_OPEN,
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

class MockSilentSocket implements WebSocketLike {
  readyState = WS_CONNECTING
  onopen: WebSocketLike["onopen"] = null
  onmessage: WebSocketLike["onmessage"] = null
  onerror: WebSocketLike["onerror"] = null
  onclose: WebSocketLike["onclose"] = null
  closeCount = 0
  send() {
    /* noop */
  }
  close() {
    this.closeCount += 1
    this.readyState = WS_CLOSED
  }
}

class MockOpenSocket implements WebSocketLike {
  readyState = WS_CONNECTING
  onopen: WebSocketLike["onopen"] = null
  onmessage: WebSocketLike["onmessage"] = null
  onerror: WebSocketLike["onerror"] = null
  onclose: WebSocketLike["onclose"] = null
  sent: string[] = []
  closeCount = 0
  constructor() {
    queueMicrotask(() => {
      this.readyState = WS_OPEN
      this.onopen?.(new Event("open"))
    })
  }
  send(data: string) {
    this.sent.push(data)
  }
  close() {
    this.closeCount += 1
    this.readyState = WS_CLOSED
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

  test("non-Error failures use a stable message", () => {
    expect(connectionFailureState("nope")).toEqual({
      state: "failed",
      message: "Connection failed",
    })
  })

  test("times out and closes a socket that never opens", async () => {
    const socket = new MockSilentSocket()
    const client = new CdpLiveClient({
      url: "ws://127.0.0.1:8787",
      createSocket: () => socket,
      connectTimeoutMs: 20,
    })
    await expect(client.connect()).rejects.toThrow(/timed out/)
    expect(client.state).toBe("failed")
    expect(socket.closeCount).toBe(1)
  })
})

describe("CdpLiveClient session", () => {
  test("connects once, sends incrementing commands, and ignores a late error", async () => {
    const sockets: MockOpenSocket[] = []
    const seenUrls: string[] = []
    const client = new CdpLiveClient({
      url: "ws://127.0.0.1:8787",
      createSocket: (url) => {
        seenUrls.push(url)
        const socket = new MockOpenSocket()
        sockets.push(socket)
        return socket
      },
      connectTimeoutMs: 500,
    })
    await client.connect()
    await client.connect()
    expect(seenUrls).toEqual(["ws://127.0.0.1:8787"])
    expect(client.state).toBe("connected")
    const socket = sockets[0]
    expect(socket).toBeDefined()
    socket?.onerror?.(new Event("error"))
    expect(client.state).toBe("connected")

    expect(client.sendRequest("Page.navigate", { url: "https://example.test" })).toBe(1)
    expect(client.sendRequest("DOM.getDocument")).toBe(2)
    expect(socket?.sent.map((raw) => JSON.parse(raw))).toEqual([
      { id: 1, method: "Page.navigate", params: { url: "https://example.test" } },
      { id: 2, method: "DOM.getDocument" },
    ])

    socket?.onclose?.({})
    expect(client.state).toBe("disconnected")
    client.disconnect()
    expect(socket?.closeCount).toBe(1)
    expect(() => client.sendRequest("Page.navigate")).toThrow(/Not connected/)
  })

  test("refuses to send before a socket is open", () => {
    const client = new CdpLiveClient({
      url: "ws://127.0.0.1:8787",
      createSocket: () => {
        throw new Error("should not connect")
      },
    })
    expect(() => client.sendRequest("Page.navigate")).toThrow(/Not connected/)
  })

  test("handleMessage accepts responses and ignores events", () => {
    const client = new CdpLiveClient({
      url: "ws://127.0.0.1:8787",
      createSocket: () => new MockSilentSocket(),
    })
    expect(client.handleMessage('{"id":1,"result":{"ok":true}}')).toEqual({
      id: 1,
      result: { ok: true },
    })
    expect(
      client.handleMessage('{"id":2,"error":{"code":-1,"message":"nope"}}'),
    ).toEqual({ id: 2, error: { code: -1, message: "nope" } })
    expect(client.handleMessage('{"method":"Page.frameNavigated"}')).toBeNull()
    expect(() => client.handleMessage("not-json")).toThrow()
  })
})
