import type { Client } from "screen-relay"

export type AgentLoopStep = {
  at: string
  action: string
  beforeThumbB64: string
  afterThumbB64: string | null
}

export type AgentLoopResult = {
  startedAt: string
  finishedAt: string
  steps: AgentLoopStep[]
}

const CLICK_X = 0.52
const CLICK_Y = 0.38

function toB64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64")
}

/** Real SDK control loop: screenshot → click → type → key → screenshot. */
export async function runAgentLoop(client: Client): Promise<AgentLoopResult> {
  const startedAt = new Date().toISOString()
  const steps: AgentLoopStep[] = []

  const before0 = await client.screenshot()
  steps.push({
    at: new Date().toISOString(),
    action: "initial screenshot",
    beforeThumbB64: toB64(before0),
    afterThumbB64: null,
  })

  await client.click(CLICK_X, CLICK_Y)
  const afterClick = await client.screenshot()
  steps.push({
    at: new Date().toISOString(),
    action: `click(${CLICK_X}, ${CLICK_Y})`,
    beforeThumbB64: toB64(before0),
    afterThumbB64: toB64(afterClick),
  })

  await client.type("relay")
  await client.key("Enter")
  const afterInput = await client.screenshot()
  steps.push({
    at: new Date().toISOString(),
    action: 'type("relay") + key(Enter)',
    beforeThumbB64: toB64(afterClick),
    afterThumbB64: toB64(afterInput),
  })

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    steps,
  }
}