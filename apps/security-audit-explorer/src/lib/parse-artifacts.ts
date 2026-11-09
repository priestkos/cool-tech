import type { AuditFinding, CoverageUnit } from "./types"

export type ParsedArtifacts =
  | { ok: true; findings: AuditFinding[]; ledger: CoverageUnit[]; reportMarkdown: string }
  | { ok: false; message: string }

export function parseDroppedFiles(files: {
  findingsJson?: string
  ledgerJson?: string
  reportMd?: string
}): ParsedArtifacts {
  if (!files.findingsJson) {
    return { ok: false, message: "findings.json is required." }
  }

  let findings: unknown
  try {
    findings = JSON.parse(files.findingsJson)
  } catch {
    return { ok: false, message: "findings.json is not valid JSON." }
  }

  let ledger: CoverageUnit[] = []
  if (files.ledgerJson) {
    try {
      ledger = JSON.parse(files.ledgerJson) as CoverageUnit[]
    } catch {
      return { ok: false, message: "coverage-ledger.json is not valid JSON." }
    }
  }

  return {
    ok: true,
    findings: findings as AuditFinding[],
    ledger,
    reportMarkdown: files.reportMd ?? "",
  }
}
