/**
 * Thin adapter around vendored Cloudflare validators.
 * Browser build uses Bun-prebundled ESM shims generated from the pinned `.cjs` sources
 * (`bun run vendor:bundle`) so error paths match upstream `validateDocument`.
 */
import reportSchema from "../../vendor/cloudflare-security-audit-skill/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8/report-schema.json"
import findingsValidator from "../vendor-shim/validate-findings.bundle.js"
import ledgerValidator from "../vendor-shim/validate-coverage-ledger.bundle.js"

type ValidatorExports = { validateDocument: (data: unknown, schema?: unknown) => string[] }

const findings = findingsValidator as ValidatorExports
const ledger = ledgerValidator as ValidatorExports

export function validateFindingsDocument(data: unknown): string[] {
  return findings.validateDocument(data, reportSchema)
}

export function validateCoverageLedgerDocument(data: unknown): string[] {
  return ledger.validateDocument(data)
}

export { reportSchema }
