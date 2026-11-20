import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { LabState } from "./types"

type Props = {
  state: LabState
  busy: boolean
  onRefreshDoctor: () => void
}

export function StatusDoctorPanel({ state, busy, onRefreshDoctor }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Status &amp; doctor</CardTitle>
        <CardDescription>
          <code className="text-xs">status()</code> / <code className="text-xs">capabilities()</code>{" "}
          from the SDK plus <code className="text-xs">screen-relay doctor --json</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={onRefreshDoctor}>
          Refresh doctor
        </Button>
        <details className="rounded-lg border border-border p-3 text-xs">
          <summary className="cursor-pointer font-medium">capabilities()</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(state.capabilities, null, 2)}
          </pre>
        </details>
        <details className="rounded-lg border border-border p-3 text-xs">
          <summary className="cursor-pointer font-medium">status()</summary>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(state.status, null, 2)}
          </pre>
        </details>
        <details className="rounded-lg border border-border p-3 text-xs" open>
          <summary className="cursor-pointer font-medium">screen-relay doctor</summary>
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap">
            {JSON.stringify(state.doctor, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  )
}