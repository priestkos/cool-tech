/**
 * Node/Bun path: call vendored .cjs validators directly (used in unit tests).
 */
import reportSchema from "../../vendor/cloudflare-security-audit-skill/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/report-schema.json"
import findingsValidator from "../../vendor/cloudflare-security-audit-skill/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/validate-findings.cjs"
import ledgerValidator from "../../vendor/cloudflare-security-audit-skill/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/validate-coverage-ledger.cjs"

export function validateFindingsDocument(data: unknown): string[] {
  return findingsValidator.validateDocument(data, reportSchema)
}

export function validateCoverageLedgerDocument(data: unknown): string[] {
  return ledgerValidator.validateDocument(data)
}
