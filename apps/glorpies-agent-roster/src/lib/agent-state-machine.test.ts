import { describe, expect, test } from "bun:test"
import { isState } from "glorpies"
import {
  agentSeedFromName,
  coerceState,
  sequenceForAgent,
  stateAtTick,
} from "./agent-state-machine"

describe("agent state machine", () => {
  test("coerces invalid states to idle via isState", () => {
    expect(coerceState("working")).toBe("working")
    expect(coerceState("not-a-state")).toBe("idle")
    expect(coerceState(null)).toBe("idle")
    if (isState("blocked")) {
      expect(coerceState("blocked")).toBe("blocked")
    }
  })

  test("uses deterministic transitions with seeded clock", () => {
    const seed = agentSeedFromName("relay-bot")
    const seq = sequenceForAgent(seed)
    expect(seq.slice(0, 3)).toEqual(["idle", "thinking", "working"])
    expect(seq[3]).toMatch(/^(waiting|blocked)$/)
    expect(seq[4]).toBe("done")

    const a0t0 = stateAtTick(0, 0, seed)
    const a0t0Again = stateAtTick(0, 0, seed)
    expect(a0t0).toBe(a0t0Again)

    const later = stateAtTick(24, 0, seed)
    expect(seq).toContain(later)
  })
})
