import { describe, expect, test } from "bun:test"
import {
  correlateTranscript,
  parseCdpFrame,
  serializeCdpFrame,
  assertReplayOrder,
} from "./framing"
import { AGENT_TASK_TRANSCRIPT } from "../fixtures/transcripts"

describe("parseCdpFrame", () => {
  test("round-trips JSON-RPC request", () => {
    const req = { id: 2, method: "DOM.getDocument", params: { depth: -1 } }
    const raw = serializeCdpFrame(req)
    expect(parseCdpFrame(raw)).toEqual(req)
  })

  test("parses CDP events without id", () => {
    const event = { method: "Runtime.consoleAPICalled", params: { type: "log" } }
    expect(parseCdpFrame(JSON.stringify(event))).toEqual(event)
  })
})

describe("correlateTranscript", () => {
  test("pairs requests with responses by id", () => {
    const { pairs, pendingRequestCount } = correlateTranscript(AGENT_TASK_TRANSCRIPT)
    expect(pendingRequestCount).toBe(0)
    const withResponse = pairs.filter((p) => p.response)
    expect(withResponse.length).toBeGreaterThanOrEqual(5)
    expect(
      withResponse.every(
        (p) =>
          "id" in p.request.payload &&
          p.response &&
          "id" in p.response.payload &&
          p.request.payload.id === p.response.payload.id
      )
    ).toBe(true)
  })
})

describe("assertReplayOrder", () => {
  test("accepts monotonic atMs", () => {
    expect(() => assertReplayOrder(AGENT_TASK_TRANSCRIPT)).not.toThrow()
  })

  test("rejects out-of-order timestamps", () => {
    const bad = [...AGENT_TASK_TRANSCRIPT]
    bad[3] = { ...bad[3], atMs: 0 }
    expect(() => assertReplayOrder(bad)).toThrow(/out of order/)
  })
})