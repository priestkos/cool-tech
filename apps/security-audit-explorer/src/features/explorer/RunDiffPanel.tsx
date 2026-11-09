import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { diffRuns } from "@/lib/run-diff"
import type { AuditRunBundle } from "@/lib/types"

export function RunDiffPanel({ left, right }: { left: AuditRunBundle; right: AuditRunBundle }) {
  const diffs = diffRuns(left, right)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Run diff (by fingerprint)</CardTitle>
        <p className="text-muted-foreground text-sm">
          Comparing {left.label} → {right.label}
        </p>
      </CardHeader>
      <CardContent>
        {diffs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No finding changes between runs.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {diffs.map((diff) => (
              <li key={diff.fingerprint} className="border-border/70 rounded-md border p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      diff.kind === "added" ? "default" : diff.kind === "removed" ? "destructive" : "secondary"
                    }
                  >
                    {diff.kind}
                  </Badge>
                  <span className="font-mono text-xs">{diff.fingerprint}</span>
                </div>
                {diff.kind === "changed" && diff.changedFields ? (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Changed: {diff.changedFields.join(", ")}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
