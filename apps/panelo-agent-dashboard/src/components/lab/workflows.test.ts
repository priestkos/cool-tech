import { describe, expect, test } from "bun:test"
import { seedWorkflows } from "./workflows"

function pauseWorkflow(rows: typeof seedWorkflows, id: string) {
  return rows.map((w) => (w.id === id ? { ...w, paused: true, status: "paused" as const } : w))
}

function deleteWorkflow(rows: typeof seedWorkflows, id: string) {
  return rows.filter((w) => w.id !== id)
}

describe("workflow fixture", () => {
  test("pause toggles coverage alerts row", () => {
    const next = pauseWorkflow(seedWorkflows, "coverage-alert")
    const row = next.find((w) => w.id === "coverage-alert")
    expect(row?.paused).toBe(true)
    expect(row?.status).toBe("paused")
  })

  test("delete removes row", () => {
    const next = deleteWorkflow(seedWorkflows, "client-intake")
    expect(next.some((w) => w.id === "client-intake")).toBe(false)
    expect(next.length).toBe(seedWorkflows.length - 1)
  })
})