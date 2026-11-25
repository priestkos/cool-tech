import { describe, expect, test, beforeEach } from "bun:test"
import { Readable } from "node:stream"
import type { IncomingMessage, ServerResponse } from "node:http"
import { runAgentLoop } from "./agent-loop"
import { createMockRelay } from "./mock-relay"
import { solidPng } from "./mock-png"
import { createRelayLabApiMiddleware } from "./relay-lab-api"
import { SessionManager, sessionManager } from "./session-manager"

describe("mock PNG", () => {
  test("produces valid PNG signature", () => {
    const png = solidPng(8, 8, [10, 20, 30])
    expect(png[0]).toBe(0x89)
    expect(String.fromCharCode(png[1]!, png[2]!, png[3]!)).toBe("PNG")
  })
})

describe("mock relay SDK shape", () => {
  test("agent loop produces timestamped steps with thumbnails", async () => {
    const { client, state } = createMockRelay()
    state.holder = "panel"
    const loop = await runAgentLoop(client)
    expect(loop.steps.length).toBeGreaterThanOrEqual(3)
    expect(loop.startedAt).toMatch(/^\d{4}-/)
    for (const step of loop.steps) {
      expect(step.beforeThumbB64.length).toBeGreaterThan(40)
    }
    expect(loop.steps[2]?.afterThumbB64?.length).toBeGreaterThan(40)
  })

  test("view-only blocks panel click without control holder", async () => {
    const { client } = createMockRelay()
    await expect(client.click(0.5, 0.5)).rejects.toThrow(/control/)
  })

  test("panel control allows click; viewer blocked while panel holds", async () => {
    const { client, state } = createMockRelay()
    state.holder = "panel"
    await client.click(0.4, 0.4)
    state.holder = "viewer"
    await expect(client.click(0.1, 0.1)).rejects.toThrow(/viewer/)
  })
})

describe("session manager", () => {
  let mgr: SessionManager

  beforeEach(() => {
    mgr = new SessionManager()
    mgr.resetForTests()
  })

  test("force mock connect sets mock mode and capabilities", async () => {
    const snap = await mgr.forceMockConnect()
    expect(snap.mode).toBe("mock")
    expect(snap.capabilities?.backend).toBe("mock")
    expect(snap.doctor).not.toBeNull()
  })

  test("agent loop via manager with auto panel claim", async () => {
    await mgr.forceMockConnect()
    const snap = await mgr.runAgentLoop()
    expect(snap.lastAgentLoop?.steps.length).toBeGreaterThanOrEqual(3)
    expect(mgr.controlHolder).toBe(null)
    expect(mgr.viewerAllowsInput()).toBe(false)
  })

  test("exclusive control: panel and viewer cannot hold input together", () => {
    expect(mgr.viewerAllowsInput()).toBe(false)

    mgr.setViewerMode("take-control")
    expect(mgr.controlHolder).toBe("viewer")
    expect(mgr.viewerAllowsInput()).toBe(true)
    expect(() => mgr.claimPanelControl()).toThrow("Viewer holds control")

    const released = mgr.setViewerMode("view-only")
    expect(released.controlHolder).toBe(null)
    expect(mgr.viewerAllowsInput()).toBe(false)

    mgr.claimPanelControl()
    expect(mgr.viewerAllowsInput()).toBe(false)
    expect(() => mgr.setViewerMode("take-control")).toThrow(
      "Panel holds control — release panel control first",
    )
    expect(mgr.controlHolder).toBe("panel")
    expect(mgr.setViewerMode("view-only").controlHolder).toBe("panel")
  })

  test("release clears the holder so a stale take-control mode cannot send input", () => {
    mgr.setViewerMode("take-control")
    const snap = mgr.releaseControl()
    expect(snap.viewerMode).toBe("take-control")
    expect(snap.controlHolder).toBe(null)
    expect(mgr.viewerAllowsInput()).toBe(false)
  })

  test("agent loop restores the previous holder and drops viewer input", async () => {
    await mgr.forceMockConnect()
    mgr.setViewerMode("take-control")
    const snap = await mgr.runAgentLoop()
    expect(snap.lastAgentLoop?.steps.length).toBeGreaterThanOrEqual(3)
    expect(mgr.controlHolder).toBe("viewer")
    expect(mgr.viewerAllowsInput()).toBe(false)
  })

  test("agent loop and screenshots refuse a disconnected session", async () => {
    await expect(mgr.runAgentLoop()).rejects.toThrow("Not connected")
    expect(await mgr.screenshotBytes()).toBeNull()
    const snap = mgr.disconnect()
    expect(snap.mode).toBe("disconnected")
    expect(mgr.client()).toBeNull()
  })
})

type ApiResult = {
  status: number
  nextCalled: boolean
  body: Buffer
}

async function callLabApi(
  method: string,
  url: string,
  rawBody?: string,
): Promise<ApiResult> {
  const payload =
    rawBody === undefined ? Buffer.alloc(0) : Buffer.from(rawBody, "utf8")
  const req = Readable.from(payload.length ? [payload] : []) as IncomingMessage
  req.method = method
  req.url = url
  req.headers = {}

  const chunks: Buffer[] = []
  let status = 0
  let nextCalled = false
  const res = {
    statusCode: 0,
    setHeader() {},
    end(data?: Buffer | string) {
      status = res.statusCode
      if (typeof data === "string") {
        chunks.push(Buffer.from(data))
      } else if (data) {
        chunks.push(data)
      }
    },
  }

  await createRelayLabApiMiddleware()(
    req,
    res as unknown as ServerResponse,
    () => {
      nextCalled = true
    },
  )

  return { status, nextCalled, body: Buffer.concat(chunks) }
}

describe("lab api permissions", () => {
  beforeEach(() => {
    sessionManager.resetForTests()
  })

  test("ignores routes outside the lab api", async () => {
    const result = await callLabApi("GET", "/assets/app.js")
    expect(result.nextCalled).toBe(true)
    expect(result.status).toBe(0)
  })

  test("view-only clicks are rejected and do not reach the relay", async () => {
    await sessionManager.forceMockConnect()
    const blocked = await callLabApi(
      "POST",
      "/api/lab/viewer/click",
      JSON.stringify({ x: 0.2, y: 0.3 }),
    )
    expect(blocked.status).toBe(403)
    expect(JSON.parse(blocked.body.toString("utf8")).message).toBe(
      "View-only — no input sent",
    )
    expect(sessionManager.snapshot().mock?.clicks).toBe(0)
  })

  test("viewer take-control does not deliver a click to the panel relay", async () => {
    await sessionManager.forceMockConnect()
    sessionManager.setViewerMode("take-control")
    expect(sessionManager.viewerAllowsInput()).toBe(true)

    const clicked = await callLabApi(
      "POST",
      "/api/lab/viewer/click",
      JSON.stringify({ x: 0.2, y: 0.3 }),
    )
    expect(clicked.status).toBe(400)
    expect(JSON.parse(clicked.body.toString("utf8")).message).toMatch(
      /viewer holds control/,
    )
    expect(sessionManager.snapshot().mock?.clicks).toBe(0)
  })

  test("take-control without a session returns not connected", async () => {
    sessionManager.setViewerMode("take-control")
    const missing = await callLabApi(
      "POST",
      "/api/lab/viewer/click",
      JSON.stringify({ x: 0.1, y: 0.2 }),
    )
    expect(missing.status).toBe(503)
    expect(JSON.parse(missing.body.toString("utf8")).message).toBe(
      "Not connected",
    )
  })

  test("panel control, unknown routes, and malformed JSON fail closed", async () => {
    await sessionManager.forceMockConnect()
    sessionManager.claimPanelControl()

    const conflict = await callLabApi(
      "POST",
      "/api/lab/viewer-mode",
      JSON.stringify({ mode: "take-control" }),
    )
    expect(conflict.status).toBe(400)
    expect(JSON.parse(conflict.body.toString("utf8")).message).toMatch(
      /Panel holds control/,
    )
    expect(sessionManager.viewerAllowsInput()).toBe(false)

    const missing = await callLabApi("POST", "/api/lab/nope", "{}")
    expect(missing.status).toBe(404)

    const malformed = await callLabApi("POST", "/api/lab/connect", "{")
    expect(malformed.status).toBe(400)
  })
})
