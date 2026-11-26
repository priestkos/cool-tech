import { describe, expect, test } from "bun:test"
import { applyWorkflowPause, deleteWorkflow, seedWorkflows } from "./workflows"
import type { Workflow } from "./workflows"

describe("workflow fixture", () => {
  test("pause toggles coverage alerts row", () => {
    const next = applyWorkflowPause(seedWorkflows, "coverage-alert", true)
    const row = next.find((w) => w.id === "coverage-alert")
    expect(row?.paused).toBe(true)
    expect(row?.status).toBe("paused")
  })

  test("delete removes row", () => {
    const next = deleteWorkflow(seedWorkflows, "client-intake")
    expect(next.some((w) => w.id === "client-intake")).toBe(false)
    expect(next.length).toBe(seedWorkflows.length - 1)
  })

  test("unpausing a paused row sets paused false and status active", () => {
    const next = applyWorkflowPause(seedWorkflows, "client-intake", false)
    const row = next.find((w) => w.id === "client-intake")
    expect(row?.paused).toBe(false)
    expect(row?.status).toBe("active")
  })

  test("unpausing a row whose status is error leaves status error", () => {
    const rows: Workflow[] = [{ id: "bad", name: "Bad", status: "error", lastRun: "now", paused: true }]
    const next = applyWorkflowPause(rows, "bad", false)
    expect(next[0]?.paused).toBe(false)
    expect(next[0]?.status).toBe("error")
  })

  test("pausing an error row sets status paused", () => {
    const rows: Workflow[] = [{ id: "bad", name: "Bad", status: "error", lastRun: "now", paused: false }]
    const next = applyWorkflowPause(rows, "bad", true)
    expect(next[0]?.paused).toBe(true)
    expect(next[0]?.status).toBe("paused")
  })

  test("unknown id leaves rows unchanged and does not mutate the input", () => {
    const snapshot = { ...seedWorkflows[0] }
    const next = applyWorkflowPause(seedWorkflows, "does-not-exist", true)
    expect(next.map((w) => w.id)).toEqual(seedWorkflows.map((w) => w.id))
    expect(next.every((w, i) => w === seedWorkflows[i])).toBe(true)
    expect(seedWorkflows[0]).toEqual(snapshot)
  })

  test("delete of an unknown id returns the same ids", () => {
    const next = deleteWorkflow(seedWorkflows, "does-not-exist")
    expect(next.map((w) => w.id)).toEqual(seedWorkflows.map((w) => w.id))
  })
})
