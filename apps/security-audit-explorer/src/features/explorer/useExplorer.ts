import { EXAMPLE_RUN_ALPHA, EXAMPLE_RUN_BETA } from "@/fixtures/load-examples"
import { parseDroppedFiles } from "@/lib/parse-artifacts"
import type { AuditRunBundle } from "@/lib/types"
import { validateCoverageLedgerDocument, validateFindingsDocument } from "@/lib/upstream-validation"
import { useCallback, useMemo, useState } from "react"

export function useExplorer() {
  const [primary, setPrimary] = useState<AuditRunBundle>(EXAMPLE_RUN_ALPHA)
  const [dropError, setDropError] = useState<string | null>(null)

  const primaryValidation = useMemo(
    () => ({
      findingsErrors: validateFindingsDocument(primary.findings),
      ledgerErrors: validateCoverageLedgerDocument(primary.ledger),
    }),
    [primary]
  )

  const loadAlpha = useCallback(() => {
    setPrimary(EXAMPLE_RUN_ALPHA)
    setDropError(null)
  }, [])

  const loadBetaAsPrimary = useCallback(() => {
    setPrimary(EXAMPLE_RUN_BETA)
    setDropError(null)
  }, [])

  const ingestDrop = useCallback((files: Parameters<typeof parseDroppedFiles>[0]) => {
    const parsed = parseDroppedFiles(files)
    if (!parsed.ok) {
      setDropError(parsed.message)
      return
    }
    const findingsErrors = validateFindingsDocument(parsed.findings)
    const ledgerErrors = validateCoverageLedgerDocument(parsed.ledger)
    if (findingsErrors.length > 0 || ledgerErrors.length > 0) {
      setDropError(
        [
          ...findingsErrors.map((e) => `findings: ${e}`),
          ...ledgerErrors.map((e) => `ledger: ${e}`),
        ].join(" · ")
      )
    } else {
      setDropError(null)
    }
    setPrimary({
      label: "Dropped run",
      isExample: false,
      findings: parsed.findings,
      ledger: parsed.ledger,
      reportMarkdown: parsed.reportMarkdown,
    })
  }, [])

  return {
    primary,
    primaryValidation,
    dropError,
    loadAlpha,
    loadBetaAsPrimary,
    ingestDrop,
  }
}
