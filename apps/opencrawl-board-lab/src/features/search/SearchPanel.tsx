import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SearchHit } from "@/lib/search"

export function SearchPanel({
  query,
  onQuery,
  hits,
  onOpenSession,
}: {
  query: string
  onQuery: (q: string) => void
  hits: SearchHit[]
  onOpenSession: (sessionId: string) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Label htmlFor="session-search">Search sessions &amp; memory</Label>
        <Input
          id="session-search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="cart coupon, AssertionError…"
          autoComplete="off"
        />
      </div>
      <ul className="flex flex-col gap-2" aria-live="polite">
        {hits.length === 0 ? (
          <li className="text-xs text-muted-foreground">No hits yet.</li>
        ) : (
          hits.map((hit) => (
            <li key={`${hit.sessionId}-${hit.field}-${hit.score}`}>
              <Card>
                <CardContent className="flex flex-col gap-2 pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium">{hit.agentName}</span>
                    <span className="text-[0.65rem] text-muted-foreground">
                      score {hit.score.toFixed(2)}
                    </span>
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: hit.highlightedHtml }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenSession(hit.sessionId)}
                  >
                    Open session
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}