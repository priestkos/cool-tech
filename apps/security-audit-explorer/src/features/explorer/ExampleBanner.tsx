import { Badge } from "@/components/ui/badge"

export function ExampleBanner({ label }: { label: string }) {
  return (
    <div
      role="status"
      className="border-warning/40 bg-warning/15 text-warning-foreground flex flex-col gap-1 rounded-lg border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-warning/50 bg-background/80">
          EXAMPLE DATA
        </Badge>
        <span className="font-medium">{label}</span>
      </div>
      <p className="text-warning-foreground/90 text-xs">
        Synthetic fixtures only — not real audit results against any product.
      </p>
    </div>
  )
}
