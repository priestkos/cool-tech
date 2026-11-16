import type { CdpPayload, JsonRpcRequest, JsonRpcResponse, TranscriptEntry } from "./types"

export function isRequest(payload: CdpPayload): payload is JsonRpcRequest {
  return "id" in payload && "method" in payload && !("result" in payload) && !("error" in payload)
}

export function isResponse(payload: CdpPayload): payload is JsonRpcResponse {
  return "id" in payload && ("result" in payload || "error" in payload)
}

export function parseCdpFrame(raw: string): CdpPayload {
  const parsed = JSON.parse(raw) as CdpPayload
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid CDP frame")
  }
  if ("method" in parsed && !("id" in parsed)) {
    return parsed
  }
  if ("id" in parsed && "method" in parsed) {
    return parsed as JsonRpcRequest
  }
  if ("id" in parsed) {
    return parsed as JsonRpcResponse
  }
  throw new Error("Unrecognized CDP frame")
}

export function serializeCdpFrame(payload: CdpPayload): string {
  return JSON.stringify(payload)
}

export function correlateTranscript(entries: TranscriptEntry[]) {
  const pending = new Map<number, TranscriptEntry>()
  const pairs: { request: TranscriptEntry; response?: TranscriptEntry }[] = []

  for (const entry of entries) {
    if (entry.direction === "request" && isRequest(entry.payload)) {
      pending.set(entry.payload.id, entry)
      pairs.push({ request: entry })
    } else if (entry.direction === "response" && isResponse(entry.payload)) {
      const req = pending.get(entry.payload.id)
      if (req) {
        pending.delete(entry.payload.id)
        const slot = pairs.find((p) => p.request === req)
        if (slot) slot.response = entry
      }
    }
  }

  return {
    pairs,
    orphanedResponses: [...entries].filter(
      (e) =>
        e.direction === "response" &&
        isResponse(e.payload) &&
        !pairs.some((p) => p.response === e)
    ),
    pendingRequestCount: pending.size,
  }
}

export function assertReplayOrder(entries: TranscriptEntry[]) {
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].atMs < entries[i - 1].atMs) {
      throw new Error(`Transcript out of order at index ${i}`)
    }
  }
}