import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TimelineEntry } from "@/lib/overlap"
import { formatWhen } from "@/lib/utils"

export function OverlapPanel({ timeline }: { timeline: TimelineEntry[] }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="min-w-0 flex-1">
        <h3 className="mb-2 text-sm font-semibold">Shared work timeline</h3>
        <ol className="flex flex-col gap-2">
          {timeline.map(({ attempt, overlap }) => (
            <li key={attempt.id} id={`attempt-${attempt.id}`}>
              <Card>
                <CardContent className="flex flex-col gap-1 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{attempt.kind}</Badge>
                    <span className="text-xs font-medium">{attempt.agentName}</span>
                    <span className="text-[0.65rem] text-muted-foreground">
                      {formatWhen(attempt.at)}
                    </span>
                    {overlap ? (
                      <Badge variant="warning">overlap</Badge>
                    ) : null}
                  </div>
                  <p className="text-xs">{attempt.label}</p>
                  {overlap ? (
                    <p className="text-[0.65rem] text-muted-foreground">
                      Same as earlier{" "}
                      <button
                        type="button"
                        className="underline"
                        onClick={() => {
                          document
                            .getElementById(`attempt-${overlap.earlier.id}`)
                            ?.scrollIntoView({ behavior: "smooth", block: "center" })
                        }}
                      >
                        {overlap.earlier.agentName} · {formatWhen(overlap.earlier.at)}
                      </button>
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </div>
      <Card className="lg:max-w-sm lg:shrink-0">
        <CardHeader>
          <CardTitle>How real OpenCrawl differs</CardTitle>
        </CardHeader>
        <CardContent className="text-xs leading-relaxed text-muted-foreground">
          <p className="mb-2">
            This lab flags overlaps locally from fixture session steps. Production
            OpenCrawl exposes a multiplayer context layer over MCP: agents publish
            structured traces, subscribe to rooms, and route @mentions into live
            inboxes so parallel workers see what already failed.
          </p>
          <p>
            We do not ship OpenCrawl code here. To run the upstream project, follow
            the docs on{" "}
            <a
              className="text-primary underline"
              href="https://getopencrawl.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              getopencrawl.com
            </a>{" "}
            and{" "}
            <a
              className="text-primary underline"
              href="https://github.com/getopencrawl/opencrawl-core"
              rel="noopener noreferrer"
              target="_blank"
            >
              opencrawl-core
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  )
}