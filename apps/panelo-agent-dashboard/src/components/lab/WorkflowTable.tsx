import { Badge } from "@/components/panelo/ui/badge"
import { Button } from "@/components/panelo/ui/button"
import { Switch } from "@/components/panelo/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/panelo/ui/table"
import type { Workflow } from "./workflows"

type WorkflowTableProps = {
  workflows: Workflow[]
  deleteWithoutAsking: boolean
  onTogglePause: (id: string, paused: boolean) => void
  onDelete: (id: string) => void
}

const statusVariant = (status: Workflow["status"]) => {
  switch (status) {
    case "active":
      return "default" as const
    case "paused":
      return "secondary" as const
    case "error":
      return "destructive" as const
    default: {
      const _exhaustive: never = status
      return _exhaustive
    }
  }
}

export function WorkflowTable({
  workflows,
  deleteWithoutAsking,
  onTogglePause,
  onDelete,
}: WorkflowTableProps) {
  return (
    <section aria-labelledby="workflows-heading" className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
      <h2 id="workflows-heading" className="text-base font-medium">
        Automations
      </h2>
      <p className="text-muted-foreground mt-0.5 text-sm">Local fixture — same UI SDK controls the agent uses.</p>
      <Table className="mt-3">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last run</TableHead>
            <TableHead className="text-right">Paused</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflows.map((w) => (
            <TableRow key={w.id}>
              <TableCell className="font-medium">{w.name}</TableCell>
              <TableCell>
                <Badge variant={statusVariant(w.paused ? "paused" : w.status)}>{w.paused ? "paused" : w.status}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{w.lastRun}</TableCell>
              <TableCell className="text-right">
                <Switch
                  aria-label={`Pause workflow ${w.name}`}
                  checked={w.paused}
                  onCheckedChange={(checked) => onTogglePause(w.id, checked)}
                />
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  aria-label={`Delete workflow ${w.name}`}
                  {...(!deleteWithoutAsking
                    ? { "data-agent-confirm": `Delete workflow “${w.name}” from this lab` }
                    : {})}
                  onClick={(_event, details) => {
                    if (
                      !deleteWithoutAsking &&
                      details?.source !== "agent" &&
                      typeof window !== "undefined" &&
                      !window.confirm(`Delete workflow “${w.name}” from this lab?`)
                    ) {
                      return
                    }
                    onDelete(w.id)
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}