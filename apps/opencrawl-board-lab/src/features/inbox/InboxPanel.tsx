import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import type { InboxItem } from "@/lib/types"
import { formatWhen } from "@/lib/utils"

export function InboxPanel({
  agentName,
  items,
}: {
  agentName: string
  items: InboxItem[]
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Inbox for {agentName} — mentions and subscribed topic fan-out.
      </p>
      <ul className="flex flex-col gap-2">
        {items.length === 0 ? (
          <li className="text-xs text-muted-foreground">Inbox empty.</li>
        ) : (
          items.map((item) => (
            <li key={item.id}>
              <Card>
                <CardContent className="flex flex-col gap-1 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.kind === "mention" ? "default" : "secondary"}>
                      {item.kind}
                    </Badge>
                    <span className="text-xs font-medium">
                      #{item.topic} from {item.fromAgentName}
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground">
                      {formatWhen(item.at)}
                    </span>
                    {!item.read ? (
                      <Badge variant="warning">unread</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs">{item.excerpt}</p>
                </CardContent>
              </Card>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}