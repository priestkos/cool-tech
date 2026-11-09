import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CoverageUnit } from "@/lib/types"
import { cn } from "@/lib/utils"

const STATUS_COLORS: Record<string, string> = {
  covered: "bg-success/80 text-success-foreground",
  candidate: "bg-warning/85 text-warning-foreground",
  planned: "bg-muted text-foreground",
  blocked: "bg-destructive/75 text-white",
  not_applicable: "bg-secondary text-secondary-foreground",
  in_progress: "bg-primary/70 text-primary-foreground",
  deferred: "bg-muted-foreground/30",
  out_of_scope: "bg-border",
}

export function CoverageHeatmap({ ledger }: { ledger: CoverageUnit[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Coverage heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        {ledger.length === 0 ? (
          <p className="text-muted-foreground text-sm">No coverage ledger loaded.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {ledger.map((unit) => (
              <li
                key={unit.coverage_id}
                className={cn(
                  "rounded-md px-3 py-2 text-xs shadow-sm ring-1 ring-black/5",
                  STATUS_COLORS[unit.status] ?? "bg-muted"
                )}
              >
                <p className="font-medium">{unit.surface}</p>
                <p className="opacity-90">
                  {unit.subsystem} · {unit.attack_class}
                </p>
                <p className="mt-1 font-mono text-[0.65rem] opacity-80">{unit.status}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
