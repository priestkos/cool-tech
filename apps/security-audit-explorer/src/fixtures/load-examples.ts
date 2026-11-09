import type { AuditRunBundle } from "@/lib/types"
import alphaFindings from "./example-run-alpha/findings.json"
import alphaLedger from "./example-run-alpha/coverage-ledger.json"
import alphaReport from "./example-run-alpha/REPORT.md?raw"
import betaFindings from "./example-run-beta/findings.json"
import betaLedger from "./example-run-beta/coverage-ledger.json"
import betaReport from "./example-run-beta/REPORT.md?raw"

export const EXAMPLE_RUN_ALPHA: AuditRunBundle = {
  label: "Example Run Alpha",
  isExample: true,
  findings: alphaFindings as AuditRunBundle["findings"],
  ledger: alphaLedger as AuditRunBundle["ledger"],
  reportMarkdown: alphaReport,
}

export const EXAMPLE_RUN_BETA: AuditRunBundle = {
  label: "Example Run Beta",
  isExample: true,
  findings: betaFindings as AuditRunBundle["findings"],
  ledger: betaLedger as AuditRunBundle["ledger"],
  reportMarkdown: betaReport,
}
