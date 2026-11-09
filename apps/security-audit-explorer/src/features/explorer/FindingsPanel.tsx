import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AuditFinding, FindingVerdict } from "@/lib/types"
import { useMemo } from "react"

const VERDICT_TABS: FindingVerdict[] = ["confirmed", "needs_validation", "rejected"]

export function FindingsPanel({ findings }: { findings: AuditFinding[] }) {
  const byVerdict = useMemo(() => {
    return Object.fromEntries(
      VERDICT_TABS.map((verdict) => [verdict, findings.filter((f) => f.verdict === verdict)])
    ) as Record<FindingVerdict, AuditFinding[]>
  }, [findings])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Findings by status</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="confirmed">
          <TabsList aria-label="Finding verdict filters" className="mb-4 w-full justify-start">
            {VERDICT_TABS.map((verdict) => (
              <TabsTrigger key={verdict} value={verdict}>
                {labelForVerdict(verdict)} ({byVerdict[verdict].length})
              </TabsTrigger>
            ))}
          </TabsList>
          {VERDICT_TABS.map((verdict) => (
            <TabsContent key={verdict} value={verdict} className="space-y-3">
              {byVerdict[verdict].length === 0 ? (
                <p className="text-muted-foreground text-sm">No findings in this tab.</p>
              ) : (
                byVerdict[verdict].map((finding) => (
                  <FindingCard key={finding.fingerprint} finding={finding} />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

function FindingCard({ finding }: { finding: AuditFinding }) {
  const severity =
    finding.severity && typeof finding.severity === "object" && "overall_severity" in finding.severity
      ? String(finding.severity.overall_severity)
      : null
  const openQuestions = finding.blockers ?? []

  return (
    <article className="border-border/80 bg-card/50 rounded-lg border p-3 shadow-sm">
      <FindingHeader finding={finding} severity={severity} />
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{finding.description}</p>
      {finding.trace && finding.trace.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide">Trace</p>
          <ol className="text-muted-foreground mt-1 space-y-1 text-xs">
            {finding.trace.map((step, index) => (
              <li key={`${step.file}-${step.line}-${index}`}>
                <span className="text-foreground font-medium">{step.kind}</span> — {step.file}:{step.line}{" "}
                · {step.description}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
      {openQuestions.length > 0 ? (
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide">Open questions / blockers</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs">
            {openQuestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}

function FindingHeader({ finding, severity }: { finding: AuditFinding; severity: string | null }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h3 className="text-foreground font-medium">{finding.title}</h3>
        <p className="text-muted-foreground font-mono text-xs">{finding.fingerprint}</p>
      </div>
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline">{finding.verdict.replace("_", " ")}</Badge>
        {severity ? <Badge variant="secondary">severity: {severity}</Badge> : null}
      </div>
    </header>
  )
}

function labelForVerdict(verdict: FindingVerdict): string {
  switch (verdict) {
    case "confirmed":
      return "Confirmed"
    case "needs_validation":
      return "Needs validation"
    case "rejected":
      return "Rejected"
    default: {
      const exhaustive: never = verdict
      return exhaustive
    }
  }
}
