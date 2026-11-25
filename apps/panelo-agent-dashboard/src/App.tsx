import { useCallback, useState } from "react"
import SchedulePage from "@/components/panelo/blocks/dashboard-pages/thirteen/index"
import { SalesChart } from "@/components/panelo/blocks/charts/sales-chart"
import { TrendsChart } from "@/components/panelo/blocks/charts/trends-chart"
import { AboutCredits } from "@/components/lab/AboutCredits"
import { AgentLabPanel } from "@/components/lab/AgentLabPanel"
import { WorkflowTable } from "@/components/lab/WorkflowTable"
import { seedWorkflows, type Workflow } from "@/components/lab/workflows"
import { Badge } from "@/components/panelo/ui/badge"

export default function App() {
  const [workflows, setWorkflows] = useState<Workflow[]>(seedWorkflows)
  const [deleteWithoutAsking, setDeleteWithoutAsking] = useState(false)

  const onTogglePause = useCallback((id: string, paused: boolean) => {
    setWorkflows((rows) =>
      rows.map((w) =>
        w.id === id
          ? { ...w, paused, status: paused ? "paused" : w.status === "paused" ? "active" : w.status }
          : w,
      ),
    )
  }, [])

  const onDelete = useCallback((id: string) => {
    setWorkflows((rows) => rows.filter((w) => w.id !== id))
  }, [])

  return (
    <div className="bg-background text-foreground min-h-dvh">
      <header className="border-border/70 border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="space-y-1">
            <p className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold tracking-tight">Panelo Agent Dashboard</span>
              <Badge variant="outline">paneloui @ 6517e2e</Badge>
              <Badge variant="secondary">ui-sdk 0.1.0-beta.2</Badge>
            </p>
            <p className="text-muted-foreground max-w-3xl text-sm">
              Real Home Care Schedule, Sales Trend + Trends charts, fixture workflows, and scripted{" "}
              <code className="text-xs">useAgentChat().play()</code> — fully offline.
            </p>
          </div>
          <AboutCredits />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/70 shadow-xs">
            <div className="h-[min(72vh,820px)] [&>div]:!h-full [&>div]:!min-h-0">
              <SchedulePage />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <SalesChart />
            <TrendsChart />
          </div>

          <WorkflowTable
            workflows={workflows}
            deleteWithoutAsking={deleteWithoutAsking}
            onTogglePause={onTogglePause}
            onDelete={onDelete}
          />
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <AgentLabPanel
            deleteWithoutAsking={deleteWithoutAsking}
            onDeleteWithoutAsking={setDeleteWithoutAsking}
            coverageWorkflowId="coverage-alert"
          />
        </div>
      </div>
    </div>
  )
}