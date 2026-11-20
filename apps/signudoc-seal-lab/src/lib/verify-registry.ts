/**
 * Local verify registry adapted from SignuDoc verify.ts (no remote API).
 */
export type VerifyRecord = {
  envelopeId: string
  title: string
  status: "completed" | "declined" | "voided"
  finishedAt: number
  signerCount: number
  signedPdfSha256: string
  certificateSha256?: string
}

export type VerifyResult =
  | { kind: "unknown" }
  | { kind: "modified"; computedHash: string }
  | {
      kind: "match"
      record: VerifyRecord
      fileKind: "signed-document" | "certificate"
    }

export class VerifyRegistry {
  private records = new Map<string, VerifyRecord>()

  register(record: VerifyRecord): void {
    this.records.set(record.signedPdfSha256, record)
    if (record.certificateSha256) {
      this.records.set(record.certificateSha256, record)
    }
  }

  verify(computedHash: string, knownGoodHash: string): VerifyResult {
    const record = this.records.get(computedHash)
    if (record) {
      return {
        kind: "match",
        record,
        fileKind:
          record.signedPdfSha256 === computedHash
            ? "signed-document"
            : "certificate",
      }
    }

    const partial = [...this.records.values()].find(
      (r) =>
        r.signedPdfSha256 === knownGoodHash ||
        r.certificateSha256 === knownGoodHash,
    )
    if (partial && computedHash !== knownGoodHash) {
      return { kind: "modified", computedHash }
    }

    return { kind: "unknown" }
  }

  lookup(hash: string): VerifyRecord | undefined {
    return this.records.get(hash)
  }

  list(): VerifyRecord[] {
    return [...this.records.values()]
  }

  toJSON(): VerifyRecord[] {
    return this.list()
  }

  static fromJSON(rows: VerifyRecord[]): VerifyRegistry {
    const registry = new VerifyRegistry()
    for (const row of rows) {
      registry.register(row)
    }
    return registry
  }
}