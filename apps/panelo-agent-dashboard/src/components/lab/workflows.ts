export type WorkflowStatus = "active" | "paused" | "error"

export type Workflow = {
  id: string
  name: string
  status: WorkflowStatus
  lastRun: string
  paused: boolean
}

export const seedWorkflows: Workflow[] = [
  { id: "evv-nightly", name: "EVV nightly rollup", status: "active", lastRun: "Today 2:10 AM", paused: false },
  { id: "coverage-alert", name: "Coverage gap alerts", status: "active", lastRun: "Today 8:52 AM", paused: false },
  { id: "client-intake", name: "Client intake sync", status: "paused", lastRun: "Yesterday 4:30 PM", paused: true },
]