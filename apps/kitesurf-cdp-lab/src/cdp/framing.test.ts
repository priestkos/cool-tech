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

  test("parses error responses", () => {
    const error = { id: 4, error: { code: -32000, message: "nope" } }
    expect(parseCdpFrame(JSON.stringify(error))).toEqual(error)
  })

  test("rejects malformed frames", () => {
    expect(() => parseCdpFrame("not-json")).toThrow()
    expect(() => parseCdpFrame("null")).toThrow(/Invalid CDP frame/)
    expect(() => parseCdpFrame("[]")).toThrow(/Unrecognized CDP frame/)
    expect(() => parseCdpFrame('{"foo":1}')).toThrow(/Unrecognized CDP frame/)
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

  test("tracks pending requests and orphaned responses", () => {
    const request = {
      atMs: 0,
      direction: "request" as const,
      payload: { id: 1, method: "Page.navigate" },
    }
    const response = {
      atMs: 1,
      direction: "response" as const,
      payload: { id: 1, result: { frameId: "a" } },
    }
    const orphan = {
      atMs: 2,
      direction: "response" as const,
      payload: { id: 99, error: { code: 1, message: "missing" } },
    }
    const event = {
      atMs: 3,
      direction: "event" as const,
      payload: { method: "Runtime.consoleAPICalled" },
    }
    const pending = {
      atMs: 4,
      direction: "request" as const,
      payload: { id: 2, method: "DOM.getDocument" },
    }
    const result = correlateTranscript([request, response, orphan, event, pending])
    expect(result.pendingRequestCount).toBe(1)
    expect(result.orphanedResponses).toEqual([orphan])
    expect(result.pairs).toHaveLength(2)
    expect(result.pairs[0]?.response).toBe(response)
    expect(result.pairs[1]?.response).toBeUndefined()
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