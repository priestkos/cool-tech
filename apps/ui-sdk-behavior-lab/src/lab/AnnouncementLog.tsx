import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type AnnouncementLogProps = {
  entries: readonly string[]
}

export function AnnouncementLog({ entries }: AnnouncementLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Announcement log</CardTitle>
        <CardDescription>
          Mirrors polite live-region text for reorder and multi-select events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="max-h-40 space-y-1 overflow-auto font-mono text-[0.65rem]">
          {entries.length === 0 ? (
            <li className="text-muted-foreground">No announcements yet.</li>
          ) : (
            entries.map((entry, index) => (
              <li key={`${index}-${entry}`}>{entry}</li>
            ))
          )}
        </ol>
      </CardContent>
    </Card>
  )
}
