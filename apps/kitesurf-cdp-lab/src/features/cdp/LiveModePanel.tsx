import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { ConnectionState } from "@/cdp/types"

const stateVariant: Record<
  ConnectionState,
  "outline" | "default" | "destructive" | "secondary"
> = {
  disconnected: "outline",
  connecting: "secondary",
  connected: "default",
  failed: "destructive",
}

type Props = {
  enabled: boolean
  state: ConnectionState
  message: string | null
  wsUrl: string
  onToggle: (next: boolean) => void
}

export function LiveModePanel({ enabled, state, message, wsUrl, onToggle }: Props) {
  return (
    <section className="space-y-4" aria-labelledby="live-mode-heading">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 id="live-mode-heading" className="font-heading text-sm font-medium">
            Live mode
          </h2>
          <p className="text-muted-foreground text-xs">
            Connect your own Kitesurf at <code className="text-foreground">{wsUrl}</code>
          </p>
        </div>
        <div className="group/field-label flex items-center gap-2">
          <Label htmlFor="live-switch">Enable</Label>
          <Switch
            id="live-switch"
            checked={enabled}
            onCheckedChange={onToggle}
            aria-describedby="live-status"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span id="live-status" className="sr-only">
          Connection state
        </span>
        <Badge variant={stateVariant[state]}>{state}</Badge>
        {enabled && state === "failed" ? (
          <p className="text-destructive text-xs" role="status">
            {message ?? "Could not connect — start Kitesurf locally, then retry."}
          </p>
        ) : null}
        {enabled && state === "connected" && message ? (
          <p className="text-success text-xs" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  )
}