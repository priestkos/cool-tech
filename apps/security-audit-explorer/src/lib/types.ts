export type FindingVerdict = "confirmed" | "needs_validation" | "rejected"

export interface AuditFinding {
  verdict: FindingVerdict
  fingerprint: string
  title: string
  description: string
  trace?: Array<{ kind: string; file: string; line: number; description: string }>
  blockers?: string[]
  severity?: { overall_severity?: string }
  [key: string]: unknown
}

export interface CoverageUnit {
  coverage_id: string
  surface: string
  subsystem: string
  attack_class: string
  status: string
  boundary: string
  unresolved?: string[]
}

export interface AuditRunBundle {
  label: string
  isExample: boolean
  findings: AuditFinding[]
  ledger: CoverageUnit[]
  reportMarkdown: string
}
