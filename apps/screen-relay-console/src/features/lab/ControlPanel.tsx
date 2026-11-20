import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LabState } from "./types"

type Props = {
  state: LabState
  busy: boolean
  error: string | null
  onConnect: (forceMock?: boolean) => void
  onDisconnect: () => void
  onClaimPanel: () => void
  onReleaseControl: () => void
}

function modeBadge(mode: LabState["mode"]) {
  switch (mode) {
    case "live":
      return <Badge className="bg-success text-success-foreground">Live engine</Badge>
    case "mock":
      return <Badge variant="secondary">Mock mode</Badge>
    default:
      return <Badge variant="outline">Disconnected</Badge>
  }
}

export function ControlPanel({
  state,
  busy,
  error,
  onConnect,
  onDisconnect,
  onClaimPanel,
  onReleaseControl,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          Session control
          {modeBadge(state.mode)}
        </CardTitle>
        <CardDescription>
          Attach via the real{" "}
          <code className="text-xs">screen-relay</code> Node SDK on loopback{" "}
          <code className="text-xs">{state.engineUrl}</code>, or fall back to mock frames when no
          engine is running.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={busy || state.mode !== "disconnected"} onClick={() => onConnect()}>
            Start / attach
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy || state.mode !== "disconnected"}
            onClick={() => onConnect(true)}
          >
            Force mock
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy || state.mode === "disconnected"}
            onClick={onDisconnect}
          >
            Disconnect
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy || state.mode === "disconnected" || state.controlHolder === "panel"}
            onClick={onClaimPanel}
          >
            Panel takes control
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy || state.controlHolder === null}
            onClick={onReleaseControl}
          >
            Release control
          </Button>
        </div>
        {state.controlHolder ? (
          <p className="text-muted-foreground text-sm" role="status">
            Control holder: <strong className="text-foreground">{state.controlHolder}</strong>
            {state.controlHolder === "panel"
              ? " — viewer input is blocked"
              : " — agent panel input is blocked"}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">No controller — view-only until claimed.</p>
        )}
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}