import { useEffect, useId, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ToastSnapshot } from "./model"

type Props = {
  toast: ToastSnapshot
  motionEnabled: boolean
  dismissPaused: boolean
  onDismiss: () => void
  onAction: () => void
  onMarkErrorAnnounced: () => void
  onPauseChange: (paused: boolean) => void
}

const statusSurface: Record<
  Exclude<ToastSnapshot["status"], "hidden">,
  string
> = {
  loading:
    "border-border bg-card text-card-foreground shadow-md",
  success:
    "border-success/30 bg-[color-mix(in_oklch,var(--card),var(--success)_12%)] text-card-foreground shadow-md",
  error:
    "border-destructive/35 bg-[color-mix(in_oklch,var(--card),var(--destructive)_10%)] text-card-foreground shadow-md",
  progress:
    "border-border bg-card text-card-foreground shadow-md",
}

export function ToastStage({
  toast,
  motionEnabled,
  dismissPaused,
  onDismiss,
  onAction,
  onMarkErrorAnnounced,
  onPauseChange,
}: Props) {
  const titleId = useId()
  const descId = useId()
  const statusRef = useRef<HTMLDivElement>(null)
  const visible = toast.status !== "hidden"

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && visible) {
        event.preventDefault()
        onDismiss()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onDismiss, visible])

  useEffect(() => {
    if (toast.status === "error" && !toast.errorAnnounced) {
      onMarkErrorAnnounced()
    }
  }, [onMarkErrorAnnounced, toast.errorAnnounced, toast.status, toast.title])

  const politeMessage =
    toast.status === "error" && !toast.errorAnnounced
      ? `${toast.title}. ${toast.description ?? ""}`
      : toast.status === "success"
        ? toast.title
        : ""

  return (
    <section
      aria-label="Live toast stage"
      className="relative flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-border/70 bg-[color-mix(in_oklch,var(--background),var(--foreground)_3%)] p-6 sm:min-h-[260px]"
      data-motion={motionEnabled ? "on" : "off"}
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {politeMessage}
      </div>
      {toast.status === "error" ? (
        <div className="sr-only" role="alert" aria-atomic="true">
          {toast.errorAnnounced ? "" : politeMessage}
        </div>
      ) : null}

      {!visible ? (
        <p className="text-muted-foreground text-sm">Trigger a control to morph the toast here.</p>
      ) : (
        <div
          ref={statusRef}
          role="status"
          aria-labelledby={titleId}
          aria-describedby={toast.description ? descId : undefined}
          className={cn(
            "toast-morph toast-morph-enter w-full max-w-md rounded-xl border px-4 py-3",
            statusSurface[toast.status as keyof typeof statusSurface],
          )}
          onMouseEnter={() => onPauseChange(true)}
          onMouseLeave={() => onPauseChange(false)}
          onFocusCapture={() => onPauseChange(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) onPauseChange(false)
          }}
        >
          <div className="flex items-start gap-3">
            <StatusGlyph status={toast.status as keyof typeof statusSurface} />
            <div className="min-w-0 flex-1 space-y-1">
              <p id={titleId} className="text-sm font-semibold tracking-tight">
                {toast.title}
              </p>
              {toast.description ? (
                <p id={descId} className="text-muted-foreground text-xs leading-relaxed">
                  {toast.description}
                </p>
              ) : null}
              {toast.status === "progress" && toast.progress !== null ? (
                <div className="pt-2">
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={toast.progress}
                    className="h-1.5 overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className="toast-morph h-full rounded-full bg-primary"
                      style={{ width: `${toast.progress}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground mt-1 text-[0.65rem] tabular-nums">
                    {toast.progress}%
                  </p>
                </div>
              ) : null}
            </div>
            {toast.actionLabel ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={onAction}
              >
                {toast.actionLabel}
              </Button>
            ) : null}
          </div>
          {dismissPaused && toast.status !== "loading" ? (
            <p className="text-muted-foreground mt-2 text-[0.65rem]">Dismiss paused — pointer on toast</p>
          ) : null}
        </div>
      )}
    </section>
  )
}

function StatusGlyph({ status }: { status: Exclude<ToastSnapshot["status"], "hidden"> }) {
  const base = "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
  if (status === "loading") {
    return (
      <span className={cn(base, "border border-border bg-muted text-muted-foreground")} aria-hidden>
        …
      </span>
    )
  }
  if (status === "success") {
    return (
      <span className={cn(base, "bg-success/20 text-success")} aria-hidden>
        ✓
      </span>
    )
  }
  if (status === "error") {
    return (
      <span className={cn(base, "bg-destructive/15 text-destructive")} aria-hidden>
        !
      </span>
    )
  }
  return (
    <span className={cn(base, "border border-border bg-muted")} aria-hidden>
      %
    </span>
  )
}
