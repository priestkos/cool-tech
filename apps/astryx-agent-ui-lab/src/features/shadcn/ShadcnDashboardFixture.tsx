import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LabPreferences } from "@/lab/types.ts"

const METRICS = [
  { label: "Runs today", value: "12", hint: "Local fixture" },
  { label: "Success rate", value: "91%", hint: "Static sample" },
  { label: "Queue depth", value: "3", hint: "Not live data" },
] as const

type Props = {
  preferences: LabPreferences
}

export function ShadcnDashboardFixture({ preferences }: Props) {
  const gap = preferences.density === "compact" ? "gap-2" : "gap-4"

  return (
    <div className={cn("flex flex-col", gap)}>
      <div>
        <h2 className="text-sm font-semibold">Ops snapshot</h2>
        <p className="text-muted-foreground text-xs">
          Signed in as {preferences.displayName}
          {preferences.notifications ? " · alerts on" : " · alerts off"}
        </p>
      </div>
      <div className={cn("grid sm:grid-cols-3", gap)}>
        {METRICS.map((m) => (
          <Card key={m.label} size="sm">
            <CardHeader>
              <Badge variant="secondary">{m.hint}</Badge>
              <CardTitle className="text-xl tabular-nums">{m.value}</CardTitle>
              <CardDescription>{m.label}</CardDescription>
            </CardHeader>
            <CardContent className="sr-only">{m.label}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
