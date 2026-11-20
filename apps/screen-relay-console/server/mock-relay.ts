import type { Capabilities, Client, InputResult, Status } from "screen-relay"
import { solidPng } from "./mock-png"

export type ControlHolder = "panel" | "viewer" | null

export type MockInputRecord = {
  at: string
  kind: "click" | "type" | "key"
  detail: string
}

export type MockRelayState = {
  frameIndex: number
  clicks: number
  typed: string
  inputs: MockInputRecord[]
  holder: ControlHolder
}

const FRAME_COLORS: Array<[number, number, number]> = [
  [72, 132, 220],
  [56, 186, 140],
  [196, 110, 178],
]

export function createMockRelay(): { client: Client; state: MockRelayState } {
  const state: MockRelayState = {
    frameIndex: 0,
    clicks: 0,
    typed: "",
    inputs: [],
    holder: null,
  }

  const capabilities = (): Capabilities => ({
    version: 1,
    backend: "mock",
    width: 640,
    height: 400,
    fps: 15,
    input: {
      keyboard: true,
      pointer: true,
      buttons: true,
      wheel: true,
    },
    screenshot: "png",
    control: "exclusive",
    wayland: false,
    max_input_pending: 8,
    input_endpoint: "/input",
    max_input_batch: 32,
    cursor: true,
    audio: false,
    clipboard: false,
    resize: false,
    ime: false,
  })

  const status = (): Status => ({
    healthy: true,
    backend: "mock",
    mock: true,
    width: 640,
    height: 400,
    clicks: state.clicks,
    typedLength: state.typed.length,
    frameIndex: state.frameIndex,
    controlHolder: state.holder,
  })

  function requireControl(source: ControlHolder) {
    if (state.holder !== null && state.holder !== source) {
      throw new Error(`Input blocked: ${state.holder} holds control`)
    }
    if (state.holder === null) {
      throw new Error("No control holder — claim control first")
    }
  }

  const screenshot = async (): Promise<Uint8Array> => {
    const rgb = FRAME_COLORS[state.frameIndex % FRAME_COLORS.length]!
    return solidPng(640, 400, rgb, `f${state.frameIndex}c${state.clicks}`)
  }

  const click = async (x: number, y: number): Promise<InputResult> => {
    requireControl("panel")
    state.clicks += 1
    state.frameIndex = Math.min(2, state.frameIndex + 1)
    state.inputs.push({
      at: new Date().toISOString(),
      kind: "click",
      detail: `click(${x.toFixed(3)}, ${y.toFixed(3)})`,
    })
    return { events: 1 }
  }

  const type = async (text: string): Promise<InputResult> => {
    requireControl("panel")
    state.typed += text
    state.frameIndex = Math.min(2, state.frameIndex + 1)
    state.inputs.push({
      at: new Date().toISOString(),
      kind: "type",
      detail: text,
    })
    return { events: text.length }
  }

  const key = async (...combos: string[]): Promise<InputResult> => {
    requireControl("panel")
    state.inputs.push({
      at: new Date().toISOString(),
      kind: "key",
      detail: combos.join(","),
    })
    return { events: combos.length }
  }

  const client: Client = {
    capabilities: async () => capabilities(),
    status: async () => status(),
    screenshot,
    click,
    move: async () => {
      requireControl("panel")
      return { events: 0 }
    },
    scroll: async () => {
      requireControl("panel")
      return { events: 0 }
    },
    key,
    type,
    input: async () => {
      requireControl("panel")
      return { events: 1 }
    },
  }

  return { client, state }
}