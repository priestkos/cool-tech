import { describe, expect, test } from "bun:test"
import { INITIAL_JOTTER_STATE } from "./jotter-model"
import { buildSnapshotTree, findInTree, isAddressable } from "./tree-builder"
import { snapshotIdFromCounter } from "./snapshot-id"
import {
  createSimulatorContext,
  dispatchCommand,
  minifyEnvelope,
  parseCommandLine,
  resetSimulatorContext,
} from "./simulator"
import {
  estimateImageTokens,
  estimateTextTokens,
  formatRatio,
} from "./tokens"

describe("snapshot id", () => {
  test("deterministic across replays", () => {
    expect(snapshotIdFromCounter(1)).toBe(snapshotIdFromCounter(1))
    expect(snapshotIdFromCounter(1)).toMatch(/^s[a-z0-9]{7}$/)
  })
})

describe("tree builder", () => {
  test("refs only on addressable nodes with qualified format", () => {
    const built = buildSnapshotTree(INITIAL_JOTTER_STATE, 1, {
      interactiveOnly: true,
      compact: true,
    })
    const refs: string[] = []
    const walk = (n: { ref_id?: string; children?: typeof n[] }) => {
      if (n.ref_id) {
        refs.push(n.ref_id)
        expect(n.ref_id).toMatch(new RegExp(`^@${built.snapshotId}:e\\d+$`))
      }
      for (const c of n.children ?? []) walk(c)
    }
    walk(built.tree)
    expect(refs.length).toBe(built.refCount)
    expect(refs.length).toBeGreaterThan(0)
  })

  test("interactive filter drops static wrappers", () => {
    const full = buildSnapshotTree(INITIAL_JOTTER_STATE, 1, {
      interactiveOnly: false,
      compact: false,
    })
    const interactive = buildSnapshotTree(INITIAL_JOTTER_STATE, 1, {
      interactiveOnly: true,
      compact: true,
    })
    expect(interactive.refCount).toBeLessThanOrEqual(full.refCount)
  })

  test("same counter yields same snapshot id on replay", () => {
    const a = buildSnapshotTree(INITIAL_JOTTER_STATE, 3, {
      interactiveOnly: true,
      compact: true,
    })
    const b = buildSnapshotTree(INITIAL_JOTTER_STATE, 3, {
      interactiveOnly: true,
      compact: true,
    })
    expect(a.snapshotId).toBe(b.snapshotId)
    expect(a.refMap.size).toBe(b.refMap.size)
  })

  test("isAddressable roles", () => {
    expect(isAddressable("button")).toBe(true)
    expect(isAddressable("statictext")).toBe(false)
  })
})

describe("command dispatcher", () => {
  test("bare ref returns INVALID_ARGS", () => {
    const ctx = createSimulatorContext(INITIAL_JOTTER_STATE)
    dispatchCommand(ctx, parseCommandLine("agent-desktop snapshot --app Jotter -i --compact")!)
    const err = dispatchCommand(
      ctx,
      parseCommandLine("agent-desktop click @e3")!,
    )
    expect(err.ok).toBe(false)
    if (!err.ok) expect(err.error.code).toBe("INVALID_ARGS")
  })

  test("STALE_REF after UI change", () => {
    const ctx = createSimulatorContext(INITIAL_JOTTER_STATE)
    const snap = dispatchCommand(
      ctx,
      parseCommandLine("agent-desktop snapshot --app Jotter -i --compact")!,
    )
    expect(snap.ok).toBe(true)
    if (!snap.ok) return
    const tree = snap.data.tree
    const newRef = findInTree(tree, "button", "New", true)[0]?.ref_id
    expect(newRef).toBeTruthy()
    dispatchCommand(ctx, parseCommandLine(`agent-desktop click ${newRef}`)!)
    const stale = dispatchCommand(
      ctx,
      parseCommandLine(`agent-desktop click ${newRef}`)!,
    )
    expect(stale.ok).toBe(false)
    if (!stale.ok) expect(stale.error.code).toBe("STALE_REF")
  })

  test("unsupported command message", () => {
    const ctx = createSimulatorContext(INITIAL_JOTTER_STATE)
    const res = dispatchCommand(
      ctx,
      parseCommandLine("agent-desktop wait --timeout-ms 500")!,
    )
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.error.message).toContain("not simulated")
    }
  })
})

describe("token estimator", () => {
  test("text bytes over 4", () => {
    expect(estimateTextTokens("abcd")).toBe(1)
    expect(estimateTextTokens("abcdefgh")).toBe(2)
  })

  test("image formula", () => {
    expect(estimateImageTokens(750, 750)).toBe(750)
    expect(estimateImageTokens(100, 100)).toBe(Math.ceil(10000 / 750))
  })

  test("ratio helper", () => {
    expect(formatRatio(100, 400)).toBe("4.0× screenshot vs tree")
  })

  test("matches hand-computed fixture", () => {
    const ctx = createSimulatorContext(INITIAL_JOTTER_STATE)
    resetSimulatorContext(ctx, INITIAL_JOTTER_STATE)
    const env = dispatchCommand(
      ctx,
      parseCommandLine("agent-desktop snapshot --app Jotter -i --compact")!,
    )
    const json = minifyEnvelope(env)
    const bytes = new TextEncoder().encode(json).length
    expect(estimateTextTokens(json)).toBe(Math.ceil(bytes / 4))
  })
})
