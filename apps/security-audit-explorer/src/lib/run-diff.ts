import type { AuditFinding, AuditRunBundle } from "./types"

export type DiffKind = "added" | "removed" | "changed"

export interface FindingDiff {
  fingerprint: string
  kind: DiffKind
  before?: AuditFinding
  after?: AuditFinding
  changedFields?: string[]
}

function fieldChanges(before: AuditFinding, after: AuditFinding): string[] {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])
  const changed: string[] = []
  for (const key of keys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changed.push(key)
    }
  }
  return changed
}

export function diffRuns(left: AuditRunBundle, right: AuditRunBundle): FindingDiff[] {
  const leftMap = new Map(left.findings.map((f) => [f.fingerprint, f]))
  const rightMap = new Map(right.findings.map((f) => [f.fingerprint, f]))
  const diffs: FindingDiff[] = []
  const ids = new Set([...leftMap.keys(), ...rightMap.keys()])

  for (const id of [...ids].sort()) {
    const before = leftMap.get(id)
    const after = rightMap.get(id)
    if (before && !after) {
      diffs.push({ fingerprint: id, kind: "removed", before })
    } else if (!before && after) {
      diffs.push({ fingerprint: id, kind: "added", after })
    } else if (before && after) {
      const changedFields = fieldChanges(before, after)
      if (changedFields.length > 0) {
        diffs.push({ fingerprint: id, kind: "changed", before, after, changedFields })
      }
    }
  }
  return diffs
}
