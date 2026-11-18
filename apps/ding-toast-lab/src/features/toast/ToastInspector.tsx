import { toast, type ToastItem } from "@yusufceng1z/ding"
import { useSyncExternalStore } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function emptyState() {
  return toast.getState()
}

function summarizeActive(items: ToastItem[]) {
  if (items.length === 0) return null
  return items[items.length - 1]
}

export function ToastInspector() {
  const state = useSyncExternalStore(toast.subscribe, toast.getState, emptyState)
  const active = summarizeActive(state.toasts)

  return (
    <section
      aria-label="Ding engine readout"
      className="relative flex min-h-[220px] w-full flex-col justify-between gap-4 rounded-2xl border border-border/70 bg-[color-mix(in_oklch,var(--background),var(--foreground)_3%)] p-6 sm:min-h-[260px]"
    >
      <div className="space-y-2">
        <h2 className="text-sm font-semibold tracking-tight">Live engine state</h2>
        <p className="text-muted-foreground text-xs leading-relaxed">
          The morphing pill renders via{" "}
          <code className="text-[0.7rem]">@yusufceng1z/ding-react</code> at{" "}
          <span className="tabular-nums">{state.position}</span>. This panel mirrors{" "}
          <code className="text-[0.7rem]">toast.getState()</code> from the real upstream store.
        </p>
      </div>

      {!active ? (
        <p className="text-muted-foreground text-sm">Trigger a control to show a Ding toast.</p>
      ) : (
        <dl className="grid gap-3 rounded-xl border border-border/80 bg-card/80 p-4 text-sm">
          <MotionRow label="Phase" value={active.phase} />
          <MotionRow label="Type" value={active.type} />
          <MotionRow label="Title" value={active.title} />
          {active.description ? (
            <MotionRow label="Description" value={active.description} />
          ) : null}
          {active.progress !== undefined ? (
            <MotionRow label="Progress" value={`${Math.round(active.progress * 100)}%`} />
          ) : null}
          {active.action ? <MotionRow label="Action" value={active.action.label} /> : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="outline" className="text-[0.65rem]">
              id {active.id.slice(0, 8)}…
            </Badge>
            <Badge variant="secondary" className="text-[0.65rem]">
              gen ×{active.count}
            </Badge>
          </div>
        </dl>
      )}

      <p className="text-muted-foreground text-[0.65rem]">
        Polite: {state.status || "—"} · Assertive: {state.alert || "—"}
      </p>
    </section>
  )
}

function MotionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className={cn("text-right font-medium", label === "Type" && "capitalize")}>{value}</dd>
    </div>
  )
}