export type WorkflowStatus = "active" | "paused" | "error"

export type Workflow = {
  id: string
  name: string
  status: WorkflowStatus
  lastRun: string
  paused: boolean
}

export function applyWorkflowPause(rows: Workflow[], id: string, paused: boolean): Workflow[] {
  return rows.map((w) =>
    w.id === id
      ? { ...w, paused, status: paused ? "paused" : w.status === "paused" ? "active" : w.status }
      : w,
  )
}

export function deleteWorkflow(rows: Workflow[], id: string): Workflow[] {
  return rows.filter((w) => w.id !== id)
}

export const seedWorkflows: Workflow[] = [
  { id: "evv-nightly", name: "EVV nightly rollup", status: "active", lastRun: "Today 2:10 AM", paused: false },
  { id: "coverage-alert", name: "Coverage gap alerts", status: "active", lastRun: "Today 8:52 AM", paused: false },
  { id: "client-intake", name: "Client intake sync", status: "paused", lastRun: "Yesterday 4:30 PM", paused: true },
]