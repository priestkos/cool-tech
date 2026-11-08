import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LogEntry } from "./board-model"

export function EventLogPanel({ entries }: { entries: LogEntry[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Event log</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="max-h-48 space-y-2 overflow-y-auto text-xs" aria-live="polite">
          {entries.length === 0 ? (
            <li className="text-muted-foreground">No events yet.</li>
          ) : (
            entries
              .slice()
              .reverse()
              .map((entry) => (
                <li key={entry.id} className="border-border/60 border-b pb-2 last:border-0">
                  <time className="text-muted-foreground block" dateTime={entry.at}>
                    {new Date(entry.at).toLocaleTimeString()}
                  </time>
                  {entry.message}
                </li>
              ))
          )}
        </ol>
      </CardContent>
    </Card>
  )
}
