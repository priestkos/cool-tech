import type { BarChartSpec } from "@/lib/charts"

export function MetricBarChart({ spec }: { spec: BarChartSpec }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">{spec.title}</p>
        <p className="text-muted-foreground text-xs">{spec.hint}</p>
      </div>
      <ul className="space-y-2" aria-label={spec.title}>
        {spec.series.map((item) => {
          const width = Math.max(4, (item.value / spec.max) * 100)
          return (
            <li key={item.id} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-2 text-xs">
              <span className="truncate text-left" title={item.label}>
                {item.label}
              </span>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className={
                    item.isBaseline
                      ? "bg-muted-foreground/40 h-full rounded-full"
                      : "bg-primary h-full rounded-full"
                  }
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="text-muted-foreground text-right tabular-nums">
                {item.display}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function MetricBarChartGrid({ specs }: { specs: BarChartSpec[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {specs.map((spec) => (
        <MetricBarChart key={spec.title} spec={spec} />
      ))}
    </div>
  )
}
