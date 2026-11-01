import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  active: boolean
  message?: string
  progress?: number
}

export function LoadingOverlay({ active, message, progress }: LoadingOverlayProps) {
  if (!active) return null
  const pct =
    progress !== undefined && Number.isFinite(progress)
      ? Math.round(Math.min(1, Math.max(0, progress)) * 100)
      : null

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-neutral-950/40 backdrop-blur-[1px]">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-lg border border-border/60 bg-background/95 px-6 py-5 shadow-lg">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-center text-sm">{message ?? "Loading…"}</p>
        {pct !== null ? (
          <div className="w-48">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1 text-center text-[11px] text-muted-foreground">{pct}%</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
