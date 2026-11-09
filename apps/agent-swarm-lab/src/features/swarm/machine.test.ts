import { describe, expect, test } from "bun:test"
import {
  beginRun,
  completeImmediately,
  INITIAL_SWARM_STATE,
  replay,
  resetSwarm,
  shouldAutoStart,
  tickSwarm,
  typingRevealIndex,
} from "./machine"

describe("shouldAutoStart", () => {
  test("trigger modes", () => {
    expect(
      shouldAutoStart("mount", {
        mounted: true,
        visible: false,
        manualSignal: 0,
      }),
    ).toBe(true)
    expect(
      shouldAutoStart("visible", {
        mounted: true,
        visible: true,
        manualSignal: 0,
      }),
    ).toBe(true)
    expect(
      shouldAutoStart("manual", {
        mounted: true,
        visible: false,
        manualSignal: 0,
      }),
    ).toBe(false)
    expect(
      shouldAutoStart("manual", {
        mounted: true,
        visible: false,
        manualSignal: 2,
      }),
    ).toBe(true)
  })
})

describe("reduced motion short-circuit", () => {
  test("tick completes immediately when reducedMotion", () => {
    const playing = beginRun(INITIAL_SWARM_STATE)
    const next = tickSwarm(playing, 16, 1, true)
    expect(next.phase).toBe("complete")
    expect(next.playing).toBe(false)
    expect(next.typeProgress).toBe(1)
  })

  test("completeImmediately sets terminal state", () => {
    const mid = { ...beginRun(INITIAL_SWARM_STATE), phase: "scan" as const, scanProgress: 0.4 }
    const done = completeImmediately(mid)
    expect(done.phase).toBe("complete")
    expect(done.scanProgress).toBe(1)
  })
})

describe("replay", () => {
  test("increments runId and resets progress", () => {
    const finished = {
      ...INITIAL_SWARM_STATE,
      phase: "complete" as const,
      runId: 2,
      typeProgress: 1,
    }
    const again = replay(finished)
    expect(again.runId).toBe(3)
    expect(again.phase).toBe("enter")
    expect(again.typeProgress).toBe(0)
    expect(again.playing).toBe(true)
  })

  test("resetSwarm returns idle baseline", () => {
    expect(resetSwarm()).toEqual(INITIAL_SWARM_STATE)
  })
})

describe("typingRevealIndex", () => {
  test("reveals floor of progress * total", () => {
    expect(typingRevealIndex(0, 12)).toBe(0)
    expect(typingRevealIndex(0.5, 11)).toBe(5)
    expect(typingRevealIndex(1, 8)).toBe(8)
    expect(typingRevealIndex(2, 8)).toBe(8)
  })
})

describe("tickSwarm progression", () => {
  test("eventually reaches complete with enough time", () => {
    let state = beginRun(INITIAL_SWARM_STATE)
    for (let i = 0; i < 600; i++) {
      state = tickSwarm(state, 20, 2, false)
      if (state.phase === "complete") break
    }
    expect(state.phase).toBe("complete")
  })
})
