import { createClient, type Capabilities, type Client, type Status } from "screen-relay"
import { spawn } from "node:child_process"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  createMockRelay,
  type ControlHolder,
  type MockRelayState,
} from "./mock-relay"
import { runAgentLoop, type AgentLoopStep, type AgentLoopResult } from "./agent-loop"

const ENGINE_URL = "http://127.0.0.1:8080"
const RELAY_ROOT = path.dirname(fileURLToPath(import.meta.url))

export type SessionMode = "disconnected" | "live" | "mock"

export type LabSnapshot = {
  mode: SessionMode
  engineUrl: string
  controlHolder: ControlHolder
  viewerMode: "view-only" | "take-control"
  capabilities: Capabilities | null
  status: Status | null
  doctor: unknown | null
  mock: MockRelayState | null
  lastAgentLoop: AgentLoopResult | null
}

export class SessionManager {
  mode: SessionMode = "disconnected"
  controlHolder: ControlHolder = null
  viewerMode: "view-only" | "take-control" = "view-only"
  capabilities: Capabilities | null = null
  status: Status | null = null
  doctor: unknown | null = null
  lastAgentLoop: AgentLoopResult | null = null

  private liveClient: Client | null = null
  private mockBundle: ReturnType<typeof createMockRelay> | null = null

  client(): Client | null {
    if (this.mode === "live") return this.liveClient
    if (this.mode === "mock") return this.mockBundle?.client ?? null
    return null
  }

  async tryConnect(): Promise<LabSnapshot> {
    const probe = createClient({ url: ENGINE_URL, timeout: 1200 })
    try {
      const caps = await probe.capabilities()
      const st = await probe.status()
      this.liveClient = createClient({ url: ENGINE_URL, timeout: 10000 })
      this.mockBundle = null
      this.mode = "live"
      this.capabilities = caps
      this.status = st
    } catch {
      await this.useMockSession()
    }
    this.controlHolder = null
    this.viewerMode = "view-only"
    await this.refreshDoctor()
    return this.snapshot()
  }

  async forceMockConnect(): Promise<LabSnapshot> {
    this.liveClient = null
    await this.useMockSession()
    this.controlHolder = null
    this.viewerMode = "view-only"
    await this.refreshDoctor()
    return this.snapshot()
  }

  private async useMockSession() {
    this.mockBundle = createMockRelay()
    this.mode = "mock"
    this.capabilities = await this.mockBundle.client.capabilities()
    this.status = await this.mockBundle.client.status()
  }

  resetForTests(): void {
    this.disconnect()
    this.doctor = null
    this.lastAgentLoop = null
  }

  disconnect(): LabSnapshot {
    this.mode = "disconnected"
    this.liveClient = null
    this.mockBundle = null
    this.capabilities = null
    this.status = null
    this.controlHolder = null
    this.viewerMode = "view-only"
    return this.snapshot()
  }

  setControl(holder: ControlHolder): LabSnapshot {
    this.controlHolder = holder
    if (this.mockBundle) {
      this.mockBundle.state.holder = holder
    }
    if (holder === "panel") {
      this.viewerMode = "view-only"
    }
    return this.snapshot()
  }

  setViewerMode(mode: "view-only" | "take-control"): LabSnapshot {
    if (mode === "take-control") {
      if (this.controlHolder === "panel") {
        throw new Error("Panel holds control — release panel control first")
      }
      this.viewerMode = "take-control"
      this.controlHolder = "viewer"
      if (this.mockBundle) this.mockBundle.state.holder = "viewer"
    } else {
      this.viewerMode = "view-only"
      if (this.controlHolder === "viewer") {
        this.controlHolder = null
        if (this.mockBundle) this.mockBundle.state.holder = null
      }
    }
    return this.snapshot()
  }

  claimPanelControl(): LabSnapshot {
    if (this.controlHolder === "viewer") {
      throw new Error("Viewer holds control")
    }
    return this.setControl("panel")
  }

  releaseControl(): LabSnapshot {
    return this.setControl(null)
  }

  async refreshStatus(): Promise<LabSnapshot> {
    const c = this.client()
    if (!c) return this.snapshot()
    this.capabilities = await c.capabilities()
    this.status = await c.status()
    return this.snapshot()
  }

  async refreshDoctor(): Promise<LabSnapshot> {
    this.doctor = await runDoctorJson()
    return this.snapshot()
  }

  async runAgentLoop(): Promise<LabSnapshot> {
    const c = this.client()
    if (!c) throw new Error("Not connected")
    const prev = this.controlHolder
    if (this.controlHolder !== "panel") {
      this.setControl("panel")
    }
    try {
      this.lastAgentLoop = await runAgentLoop(c)
      await this.refreshStatus()
      return this.snapshot()
    } finally {
      if (prev !== "panel") {
        this.setControl(prev)
      }
    }
  }

  async screenshotBytes(): Promise<Uint8Array | null> {
    const c = this.client()
    if (!c) return null
    return c.screenshot()
  }

  viewerAllowsInput(): boolean {
    return this.viewerMode === "take-control" && this.controlHolder === "viewer"
  }

  snapshot(): LabSnapshot {
    return {
      mode: this.mode,
      engineUrl: ENGINE_URL,
      controlHolder: this.controlHolder,
      viewerMode: this.viewerMode,
      capabilities: this.capabilities,
      status: this.status,
      doctor: this.doctor,
      mock: this.mockBundle?.state ?? null,
      lastAgentLoop: this.lastAgentLoop,
    }
  }
}

export const sessionManager = new SessionManager()

export type { AgentLoopStep, AgentLoopResult }

function runDoctorJson(): Promise<unknown> {
  return new Promise((resolve) => {
    const cli = path.join(RELAY_ROOT, "..", "node_modules", "screen-relay", "dist", "cli", "relay.mjs")
    const child = spawn(process.execPath, [cli, "doctor", "--json"], {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    })
    let out = ""
    child.stdout.on("data", (d: Buffer) => {
      out += d.toString("utf8")
    })
    child.on("close", () => {
      try {
        resolve(JSON.parse(out))
      } catch {
        resolve({ raw: out.trim(), parseError: true })
      }
    })
    child.on("error", (err) => {
      resolve({ error: String(err) })
    })
  })
}