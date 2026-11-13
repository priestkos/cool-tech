import { collectAriaAttributes, describeFocusedElement } from "@/behaviors/aria"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type AriaInspectorProps = {
  target: HTMLElement | null
}

export function AriaInspector({ target }: AriaInspectorProps) {
  const focused = describeFocusedElement(document.activeElement)
  const targetAria = collectAriaAttributes(target)

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>ARIA + focus</CardTitle>
        <CardDescription>
          Live attributes on the inspected control and the current focus target.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <section>
          <p className="mb-1 font-medium text-muted-foreground">Inspected</p>
          {target ? (
            <ul className="space-y-1 font-mono">
              {targetAria.length === 0 ? (
                <li className="text-muted-foreground">(no tracked ARIA)</li>
              ) : (
                targetAria.map((entry) => (
                  <li key={entry.name}>
                    {entry.name}={entry.value}
                  </li>
                ))
              )}
            </ul>
          ) : (
            <p className="text-muted-foreground">Focus a demo control</p>
          )}
        </section>
        <section>
          <p className="mb-1 font-medium text-muted-foreground">Focus</p>
          {focused ? (
            <div className="space-y-1">
              <Badge variant="outline">
                {focused.tag}#{focused.id}
              </Badge>
              <ul className="space-y-1 font-mono">
                {focused.aria.map((entry) => (
                  <li key={entry.name}>
                    {entry.name}={entry.value}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-muted-foreground">—</p>
          )}
        </section>
      </CardContent>
    </Card>
  )
}
