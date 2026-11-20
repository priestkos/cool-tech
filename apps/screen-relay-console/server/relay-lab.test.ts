import { describe, expect, test, beforeEach } from "bun:test"
import { runAgentLoop } from "./agent-loop"
import { createMockRelay } from "./mock-relay"
import { solidPng } from "./mock-png"
import { SessionManager } from "./session-manager"

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
  })
})