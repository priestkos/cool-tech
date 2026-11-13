import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const STEPS = [
  {
    key: "Tab",
    detail: "Move focus into each combobox input (visible focus ring).",
  },
  {
    key: "Type",
    detail: "Filter options (typeahead); list opens with matches.",
  },
  {
    key: "ArrowDown / ArrowUp",
    detail: "Highlight options without a pointer.",
  },
  {
    key: "Enter",
    detail: "Commit highlighted option and close the list.",
  },
  {
    key: "Escape",
    detail: "Close the list without changing the committed value.",
  },
]

export function KeyboardWalkthrough() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyboard-only walkthrough</CardTitle>
        <CardDescription>
          Perform these steps on both combobox columns. No pointer required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3 text-sm">
          {STEPS.map((step, index) => (
            <li key={step.key} className="flex gap-3">
              <Badge variant="secondary" className="shrink-0">
                {index + 1}
              </Badge>
              <div>
                <p className="font-medium">{step.key}</p>
                <p className="text-xs text-muted-foreground">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  )
}
