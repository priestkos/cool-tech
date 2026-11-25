import { describe, expect, test } from "bun:test"
import type { IncomingMessage, ServerResponse } from "node:http"
import { createHyperApiMiddleware } from "./hyper-api.ts"

class MockResponse {
  statusCode = 0
  body = ""
  headers: Record<string, string> = {}

  setHeader(name: string, value: string) {
    this.headers[name] = value
  }

  end(data?: string) {
    this.body = data ?? ""
  }

  json(): unknown {
    return JSON.parse(this.body)
  }
}

function mockReq(method: string, url: string, raw?: string): IncomingMessage {
  const payload = raw === undefined ? Buffer.alloc(0) : Buffer.from(raw)
  const req = {
    method,
    url,
    async *[Symbol.asyncIterator]() {
      if (payload.length > 0) {
        yield payload
      }
    },
  }
  return req as unknown as IncomingMessage
}

async function invoke(
  method: string,
  url: string,
  raw?: string,
): Promise<{ res: MockResponse; nextCalled: boolean }> {
  const middleware = createHyperApiMiddleware()
  const res = new MockResponse()
  let nextCalled = false
  await middleware(
    mockReq(method, url, raw),
    res as unknown as ServerResponse,
    () => {
      nextCalled = true
    },
  )
  return { res, nextCalled }
}

describe("studio API request validation", () => {
  test("ignores paths outside /api/studio", async () => {
    const { res, nextCalled } = await invoke("GET", "/assets/app.js")
    expect(nextCalled).toBe(true)
    expect(res.statusCode).toBe(0)
    expect(res.body).toBe("")
  })

  test("rejects non-POST", async () => {
    const { res, nextCalled } = await invoke("GET", "/api/studio")
    expect(nextCalled).toBe(false)
    expect(res.statusCode).toBe(405)
    expect(res.json()).toEqual({ ok: false, message: "POST required" })
  })

  test("rejects invalid JSON", async () => {
    const { res } = await invoke("POST", "/api/studio", "{")
    expect(res.statusCode).toBe(422)
    const payload = res.json() as { ok: boolean; message: string }
    expect(payload.ok).toBe(false)
    expect(payload.message.length).toBeGreaterThan(0)
  })

  test("falls back when draft fields are the wrong type", async () => {
    const { res } = await invoke(
      "POST",
      "/api/studio",
      JSON.stringify({
        action: "outline",
        draft: { heading: 12, body: false, buttonLabel: null },
      }),
    )
    expect(res.statusCode).toBe(200)
    const payload = res.json() as { ok: boolean; outline: string }
    expect(payload.ok).toBe(true)
    expect(payload.outline).toContain("Welcome to Hyper Elements Studio")
  })

  test("preserves a planted layout error through draft parsing", async () => {
    const { res } = await invoke(
      "POST",
      "/api/studio",
      JSON.stringify({
        action: "validate",
        root: "email",
        draft: { plantLayoutError: true, heading: "Hello" },
      }),
    )
    expect(res.statusCode).toBe(200)
    const payload = res.json() as {
      ok: boolean
      valid: boolean
      diagnostics: Array<{ path: string }>
    }
    expect(payload.ok).toBe(true)
    expect(payload.valid).toBe(false)
    expect(
      payload.diagnostics.some((d) => d.path.includes("marginBottom")),
    ).toBe(true)
  })

  test("rejects render when the root is missing", async () => {
    const { res } = await invoke(
      "POST",
      "/api/studio",
      JSON.stringify({ action: "render", draft: { heading: "Hello" } }),
    )
    expect(res.statusCode).toBe(422)
    const payload = res.json() as { ok: boolean; message: string }
    expect(payload.ok).toBe(false)
    expect(payload.message).toMatch(/Unknown root/)
  })

  test("rejects an unknown action", async () => {
    const { res } = await invoke(
      "POST",
      "/api/studio",
      JSON.stringify({ action: "drop-table" }),
    )
    expect(res.statusCode).toBe(422)
    const payload = res.json() as { ok: boolean; message: string }
    expect(payload.ok).toBe(false)
    expect(payload.message).toMatch(/Unknown root/)
  })
})
