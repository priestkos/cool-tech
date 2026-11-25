import { useAgentChat } from "@/components/panelo/hooks/use-agent-chat"
import { Button } from "@/components/panelo/ui/button"
import { Label } from "@/components/panelo/ui/label"
import { ScrollArea } from "@/components/panelo/ui/scroll-area"
import { Switch } from "@/components/panelo/ui/switch"
import { Bot } from "lucide-react"

type AgentLabPanelProps = {
  deleteWithoutAsking: boolean
  onDeleteWithoutAsking: (value: boolean) => void
  coverageWorkflowId: string
}

export function AgentLabPanel({
  deleteWithoutAsking,
  onDeleteWithoutAsking,
  coverageWorkflowId,
}: AgentLabPanelProps) {
  const { entries, busy, play, confirm } = useAgentChat()

  const runDemo = () =>
    play({
      prompt: "Filter Bay View, switch to week view, pause coverage alerts, try deleting it",
      steps: [
        { ref: "Service area Bay View", action: "press" },
        { ref: "Week view", action: "setPressed", args: [true] },
        { ref: "Pause workflow Coverage gap alerts", action: "setChecked", args: [true] },
        { ref: "Delete workflow Coverage gap alerts", action: "press" },
      ],
      reply: "Bay View week view is on, coverage alerts are paused, and delete waited for you if confirmations are on.",
    })

  const runFilterOnly = () =>
    play({
      prompt: "Narrow the board to Shorewood caregivers",
      steps: [
        { ref: "Search caregivers and clients", action: "setValue", args: ["Shorewood"] },
        { ref: "Service area Shorewood", action: "press" },
      ],
      reply: "Schedule filters are set to Shorewood.",
    })

  return (
    <section
      aria-labelledby="agent-heading"
      className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-xs"
    >
      <div className="flex items-center gap-2">
        <Bot className="text-primary size-5" aria-hidden />
        <div>
          <h2 id="agent-heading" className="text-base font-medium">
            Scripted agent
          </h2>
          <p className="text-muted-foreground text-xs">Offline `play()` only — no model or API key.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={busy} onClick={runDemo}>
          Run full demo
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={runFilterOnly}>
          Filter Shorewood
        </Button>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
        <Label htmlFor="delete-without-asking" className="text-sm">
          Delete without asking
        </Label>
        <Switch
          id="delete-without-asking"
          aria-label="Delete without asking"
          checked={deleteWithoutAsking}
          onCheckedChange={onDeleteWithoutAsking}
        />
      </div>

      {confirm ? (
        <div
          role="alertdialog"
          aria-labelledby="confirm-title"
          className="border-primary/30 bg-primary/5 rounded-lg border p-3"
        >
          <p id="confirm-title" className="text-sm font-medium">
            {confirm.text}
          </p>
          <div className="mt-2 flex gap-2">
            <Button type="button" size="sm" onClick={() => confirm.answer(true)}>
              Approve
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => confirm.answer(false)}>
              Decline
            </Button>
          </div>
        </div>
      ) : null}

      <div>
        <h3 className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">Action log</h3>
        <ScrollArea className="h-48 rounded-md border border-border/60 bg-background">
          <ol className="space-y-1 p-2 text-sm">
            {entries.length === 0 ? (
              <li className="text-muted-foreground px-1 py-2 text-xs">Steps from clicks and agent play() appear here.</li>
            ) : (
              entries.map((entry, i) => (
                <li key={`${entry.role}-${i}`} className="rounded px-1 py-0.5">
                  {entry.role === "step" ? (
                    <span className={entry.ok ? "text-foreground" : "text-destructive"}>
                      · {entry.text}
                    </span>
                  ) : (
                    <span className={entry.role === "user" ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {entry.role === "user" ? "You: " : "Agent: "}
                      {entry.text}
                    </span>
                  )}
                </li>
              ))
            )}
          </ol>
        </ScrollArea>
      </div>
      <p className="text-muted-foreground text-[11px]">
        Tip: declining a delete leaves workflow{" "}
        <span className="font-mono">{coverageWorkflowId}</span> in the table; approving or turning on “Delete without
        asking” removes it.
      </p>
    </section>
  )
}