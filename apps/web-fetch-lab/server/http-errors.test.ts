import { afterAll, beforeAll, describe, expect, test } from "bun:test"

let server: ReturnType<typeof Bun.spawn>
let baseUrl: string
let upstream: ReturnType<typeof Bun.serve>
let stderr = ""
const secretMarker = "PRIVATE_ERROR_MARKER_4826"

beforeAll(async () => {
  const reservation = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch: () => new Response() })
  const port = reservation.port
  reservation.stop(true)
  baseUrl = `http://127.0.0.1:${port}`
  upstream = Bun.serve({ port: 0, hostname: "127.0.0.1", fetch: () => Response.json({ error: { message: secretMarker } }, { status: 400 }) })
  server = Bun.spawn([process.execPath, "server/index.ts"], {
    cwd: `${import.meta.dir}/..`,
    env: { ...process.env, WEB_FETCH_LAB_API_PORT: String(port), OPENAI_API_KEY: secretMarker, OPENAI_BASE_URL: `http://127.0.0.1:${upstream.port}/v1` },
    stdout: "ignore",
    stderr: "pipe",
  })
  void (async () => {
    const reader = server.stderr.getReader()
    const decoder = new TextDecoder()
    for (;;) {
      const { value, done } = await reader.read()
      if (done) return
      stderr += decoder.decode(value, { stream: true })
    }
  })()
  for (let i = 0; i < 100; i++) {
    try {
      if ((await fetch(`${baseUrl}/api/health`)).ok) return
    } catch { /* wait for the child to listen */ }
    await Bun.sleep(50)
  }
  throw new Error("API server failed to start")
}, 15_000)

afterAll(() => { server?.kill(); upstream?.stop(true) })

describe("HTTP error responses", () => {
  for (const route of ["fetch", "chat"]) {
    test(`${route} does not disclose parsing or internal error details`, async () => {
      for (const body of ['{"secretMarker":']) {
        const response = await fetch(`${baseUrl}/api/${route}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
        })
        expect(response.status).toBe(400)
        expect(await response.json()).toEqual({ error: "Invalid JSON" })
      }
    })

    test(`${route} rejects invalid JSON bodies without internal details`, async () => {
      const valid = route === "fetch"
        ? { url: "https://fixture.web-fetch-lab.example/injection-test" }
        : { message: "Hello" }
      const invalid = [null, {}, [], "text", 42, { ...valid, safety: null },
        { ...valid, safety: { allowedDomains: [1] } },
        { ...valid, safety: { requireUrlInUserMessage: "false" } },
        { ...valid, safety: { maxLength: -1 } },
        { ...valid, useFixtureTransport: "true" },
        ...(route === "fetch"
          ? [{ url: 1 }, { url: "" }, { url: "not a url" }, { url: "file:///etc/passwd" }, { ...valid, offset: -1 }, { ...valid, offset: 1.5 }, { ...valid, userMessageText: 1 }]
          : [{ message: 1 }, { message: "" }, { ...valid, injectionDemo: 1 }, { ...valid, useRealModel: "false" }])]
      for (const body of invalid) {
        const response = await fetch(`${baseUrl}/api/${route}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        })
        expect([body, response.status, await response.json()]).toEqual([body, 400, { error: "Invalid request body" }])
      }
    })
  }

  for (const route of ["fetch", "chat"]) {
    test(`${route} rejects malformed allowed domain entries`, async () => {
      const valid = route === "fetch"
        ? { url: "https://fixture.web-fetch-lab.example/injection-test" }
        : { message: "Hello" }
      for (const domain of ["https://example.com", "", "foo bar", "example.com:443", "*.example.com", "example.com/path", "[::1]", "%"]) {
        const response = await fetch(`${baseUrl}/api/${route}`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...valid, safety: { allowedDomains: [domain] } }),
        })
        expect([domain, response.status, await response.json()]).toEqual([domain, 400, { error: "Invalid request body" }])
      }
    })
  }

  for (const route of ["fetch", "chat"]) {
    test(`${route} accepts valid bare domains supported by the tool`, async () => {
      const url = "https://fixture.web-fetch-lab.example/injection-test"
      const body = route === "fetch"
        ? { url, useFixtureTransport: true }
        : { message: `Read ${url}`, injectionDemo: true, useFixtureTransport: true }
      const response = await fetch(`${baseUrl}/api/${route}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...body, safety: { allowedDomains: [" FIXTURE.WEB-FETCH-LAB.EXAMPLE. ", "例え.テスト", "127.0.0.1"] } }),
      })
      expect(response.status).toBe(200)
      const result = await response.json()
      expect(route === "fetch" ? result.tool.type : result.steps[0].output.type).toBe("document")
    }, 20_000)
  }

  test("health and fixture-backed chat still work", async () => {
    expect(await (await fetch(`${baseUrl}/api/health`)).json()).toEqual({ ok: true })
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "Read https://fixture.web-fetch-lab.example/injection", injectionDemo: true, useFixtureTransport: true }),
    })
    expect(response.status).toBe(200)
    expect((await response.json()).injectionOutcome).toBe("leaked")
  }, 20_000)

  test("fixture-backed fetch still works with normal options", async () => {
    const url = "https://fixture.web-fetch-lab.example/injection-test"
    const response = await fetch(`${baseUrl}/api/fetch`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url, offset: 0, userMessageText: url, useFixtureTransport: true, safety: { allowedDomains: ["fixture.web-fetch-lab.example"], maxLength: 1000, requireUrlInUserMessage: true } }),
    })
    expect(response.status).toBe(200)
    const result = await response.json()
    expect(result.rawHtml).toContain("<html")
    expect(result.tool.type).toBe("document")
  }, 20_000)

  test("unexpected model errors are generic and do not log secrets", async () => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "hello", useRealModel: true }),
    })
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: "Unable to process request" })
    await Bun.sleep(50)
    expect(stderr).toContain("Chat request failed")
    expect(stderr).not.toContain(secretMarker)
  }, 20_000)

  test("fetch transport failures do not expose internal raw errors", async () => {
    const response = await fetch(`${baseUrl}/api/fetch`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "http://127.0.0.1/private" }),
    })
    expect(response.status).toBe(200)
    const result = await response.json()
    expect(result.rawError).toBe("Unable to fetch raw HTML")
    expect(result.tool.errorCode).toBe("url_not_allowed")
  }, 20_000)
})
