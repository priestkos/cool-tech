import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LabState } from "./types"

type Props = {
  state: LabState
  busy: boolean
  onRun: () => void
}

function thumb(b64: string, label: string) {
  return (
    <img
      src={`data:image/png;base64,${b64}`}
      alt={label}
      className="h-20 w-auto rounded border border-border bg-muted object-contain"
    />
  )
}

export function AgentLoopPanel({ state, busy, onRun }: Props) {
  const loop = state.lastAgentLoop

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Agent loop</CardTitle>
        <CardDescription>
          Screenshot → fractional click → type + key → screenshot, using the real SDK client.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button type="button" disabled={busy || state.mode === "disconnected"} onClick={onRun}>
          Run control loop
        </Button>
        {loop ? (
          <ol className="space-y-4 text-sm">
            {loop.steps.map((step) => (
              <li key={`${step.at}-${step.action}`} className="rounded-lg border border-border p-3">
                <p className="font-medium">{step.action}</p>
                <p className="text-muted-foreground text-xs">{step.at}</p>
                <div className="mt-2 flex flex-wrap items-end gap-3">
                  {thumb(step.beforeThumbB64, `Before ${step.action}`)}
                  {step.afterThumbB64 ? thumb(step.afterThumbB64, `After ${step.action}`) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-foreground text-sm">No loop run yet.</p>
        )}
      </CardContent>
    </Card>
  )
}