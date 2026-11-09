import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ValidationPanel({
  findingsErrors,
  ledgerErrors,
}: {
  findingsErrors: string[]
  ledgerErrors: string[]
}) {
  const hasErrors = findingsErrors.length > 0 || ledgerErrors.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Live schema validation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasErrors ? (
          <>
            {findingsErrors.length > 0 ? (
              <ErrorList title="findings.json" errors={findingsErrors} />
            ) : (
              <p className="text-success text-sm">findings.json — valid against vendored report-schema.json</p>
            )}
            {ledgerErrors.length > 0 ? (
              <ErrorList title="coverage-ledger.json" errors={ledgerErrors} />
            ) : (
              <p className="text-success text-sm">coverage-ledger.json — valid against vendored ledger rules</p>
            )}
          </>
        ) : (
          <p className="text-success text-sm">
            All artifacts validate against the vendored Cloudflare schema and ledger interpreters.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function ErrorList({ title, errors }: { title: string; errors: string[] }) {
  return (
    <div>
      <p className="text-destructive mb-1 text-sm font-medium">{title}</p>
      <ul className="bg-destructive/5 max-h-48 overflow-y-auto rounded-md border border-destructive/20 p-2 font-mono text-xs leading-relaxed">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  )
}
