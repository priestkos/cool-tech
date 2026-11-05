import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

type ActivityLogProps = {
  entries: string[]
}

export function ActivityLog({ entries }: ActivityLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Activity log</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-36 rounded-md border bg-muted/20 p-3">
          {entries.length === 0 ? (
            <p className="text-muted-foreground text-sm">State changes will appear here.</p>
          ) : (
            <ul className="space-y-1 font-mono text-xs">
              {entries.map((line, index) => (
                <li key={`${line}-${index}`}>{line}</li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
