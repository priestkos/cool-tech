import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buildSpec, specToJson } from "@/lab/spec.ts"
import type { FixtureId, LabPreferences } from "@/lab/types.ts"

type Props = {
  fixture: FixtureId
  preferences: LabPreferences
}

export function SpecInspector({ fixture, preferences }: Props) {
  const spec = useMemo(
    () => buildSpec(fixture, preferences),
    [fixture, preferences],
  )
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    const text = specToJson(fixture, preferences)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  function onDownload() {
    const blob = new Blob([specToJson(fixture, preferences)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `astryx-agent-ui-lab-${fixture}-spec.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>Spec inspector</CardTitle>
          <Badge variant="outline">Illustrative fixture map</Badge>
        </div>
        <CardDescription>
          Honest component/prop/token notes for the active fixture — not AI output.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {(["astryx", "shadcn"] as const).map((lib) => {
            const entry = spec[lib]
            return (
              <div
                key={lib}
                className="rounded-lg border border-border bg-muted/40 p-3"
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide">
                  {lib}
                </p>
                <ul className="flex flex-col gap-1 text-xs">
                  {entry.components.map((c) => (
                    <li key={c.name}>
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        — {JSON.stringify(c.props)}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground mt-2 text-[11px]">
                  {entry.notes}
                </p>
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => void onCopy()}>
            {copied ? "Copied" : "Copy JSON"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onDownload}>
            Download spec
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
