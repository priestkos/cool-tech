import { describe, expect, test } from "bun:test"
import { handleLabRequest } from "./handler.ts"

function post(pathname: string, body: unknown) {
  return new Request(`http://127.0.0.1${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("lab request handler", () => {
  test("OPTIONS any path returns 204", async () => {
    const res = await handleLabRequest(new Request("http://127.0.0.1/not-a-route", { method: "OPTIONS" }))
    expect(res.status).toBe(204)
  })

  test("GET /api/health reports the parent server", async () => {
    const res = await handleLabRequest(new Request("http://127.0.0.1/api/health"))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: boolean; label: string }
    expect(body.ok).toBe(true)
    expect(body.label).toBe("parent Bun server")
  })

  test("POST /api/run {} is 400", async () => {
    const res = await handleLabRequest(post("/api/run", {}))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe("code or presetId required")
  })

  test("POST /api/session/start {} is 400", async () => {
    const res = await handleLabRequest(post("/api/session/start", {}))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe("code or presetId required")
  })

  test("POST /api/session/suspend {} is 400", async () => {
    const res = await handleLabRequest(post("/api/session/suspend", {}))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe("sessionId required")
  })

  test("POST /api/resume {} is 400", async () => {
    const res = await handleLabRequest(post("/api/resume", {}))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe("bytesBase64 required")
  })

  test("POST /api/resume-child {} is 400", async () => {
    const res = await handleLabRequest(post("/api/resume-child", {}))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe("bytesBase64 required")
  })

  test("POST /api/fork {} is 400", async () => {
    const res = await handleLabRequest(post("/api/fork", {}))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe("bytesBase64 required")
  })

  test("POST /api/snapshot/corrupt {} is 400", async () => {
    const res = await handleLabRequest(post("/api/snapshot/corrupt", {}))
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe("bytesBase64 required")
  })

  test("GET /api/nope is 404", async () => {
    const res = await handleLabRequest(new Request("http://127.0.0.1/api/nope"))
    expect(res.status).toBe(404)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe("Not found")
  })

  test("POST /api/run executes rainy weather for lima", async () => {
    const res = await handleLabRequest(
      post("/api/run", { code: "return await weather.get(\"lima\")", profile: "rainy" }),
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as { ok: boolean; value: { conditions: string; city: string } }
    expect(body.ok).toBe(true)
    expect(body.value.conditions).toBe("rain")
    expect(body.value.city).toBe("Lima")
  })
})
