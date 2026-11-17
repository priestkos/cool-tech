import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatWhen } from "@/lib/utils"
import type { AgentSession, SessionStep } from "@/lib/types"

export function SessionList({
  sessions,
  selectedId,
  onSelect,
}: {
  sessions: AgentSession[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <ul className="flex flex-col gap-2" aria-label="Agent sessions">
      {sessions.map((s) => (
        <li key={s.id}>
          <Button
            type="button"
            variant={selectedId === s.id ? "secondary" : "outline"}
            className="h-auto w-full flex-col items-start gap-1 px-3 py-2 text-left"
            onClick={() => onSelect(s.id)}
            aria-current={selectedId === s.id ? "true" : undefined}
          >
            <span className="font-medium">{s.agentName}</span>
            <span className="text-[0.65rem] text-muted-foreground">
              {s.repo} · {formatWhen(s.startedAt)}
            </span>
          </Button>
        </li>
      ))}
    </ul>
  )
}

export function SessionReader({ session }: { session: AgentSession | null }) {
  if (!session) {
    return (
      <p className="text-sm text-muted-foreground">Select a session to read steps.</p>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-base font-semibold">{session.summary}</h3>
        <p className="text-xs text-muted-foreground">
          {session.agentStyle} agent on {session.repo}
        </p>
      </div>
      <ol className="flex flex-col gap-2">
        {session.steps.map((step) => (
          <li key={step.id}>
            <StepCard step={step} />
          </li>
        ))}
      </ol>
      {session.memoryFiles && session.memoryFiles.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs">Memory files</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {session.memoryFiles.map((m) => (
              <div key={m.path}>
                <code className="text-[0.65rem]">{m.path}</code>
                <pre className="mt-1 max-h-24 overflow-auto rounded-md bg-muted p-2 text-[0.65rem]">
                  {m.content}
                </pre>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function StepCard({ step }: { step: SessionStep }) {
  return (
    <Card className="py-2">
      <CardContent className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{step.kind}</Badge>
          <span className="text-[0.65rem] text-muted-foreground">
            {formatWhen(step.at)}
          </span>
        </div>
        <p className="text-xs">{step.body}</p>
        {step.file ? (
          <p className="text-[0.65rem] text-muted-foreground">file: {step.file}</p>
        ) : null}
        {step.command ? (
          <p className="font-mono text-[0.65rem]">{step.command}</p>
        ) : null}
        {step.error ? (
          <p className="text-[0.65rem] text-destructive">{step.error}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}