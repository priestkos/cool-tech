import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ReportPreview({ markdown }: { markdown: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">REPORT.md preview</CardTitle>
      </CardHeader>
      <CardContent>
        {markdown ? (
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
            {markdown}
          </pre>
        ) : (
          <p className="text-muted-foreground text-sm">No report markdown in this run.</p>
        )}
      </CardContent>
    </Card>
  )
}
