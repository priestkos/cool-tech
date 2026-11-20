/**
 * Hash-chained audit rows adapted from SignuDoc (MIT) — audit.ts @ 23add989
 */
import { canonicalJson } from "./canonical-json.ts"
import { sha256HexOfUtf8 } from "./sha256-sync.ts"

export type AuditActorType = "signer" | "sender" | "system"

export type ChainedAuditFields = {
  actorEmail: string | null
  actorType: AuditActorType
  createdAt: number
  envelopeId: string
  event: string
  id: string
  ipAddress: string | null
  metadata: Record<string, unknown> | null
  sequence: number
  userAgent: string | null
}

export type StoredAuditRow = ChainedAuditFields & {
  prevHash: string | null
  rowHash: string | null
}

export function computeAuditRowHash(
  previousHash: string | null,
  fields: ChainedAuditFields,
): string {
  return sha256HexOfUtf8(
    `${previousHash ?? ""}\n${canonicalJson(fields)}`,
  )
}

export type AuditChainCheck =
  | { chainedEvents: number; ok: true }
  | { brokenAtSequence: number; chainedEvents: number; ok: false }

/** Recomputes a chain and reports the first row that disagrees (SignuDoc parity). */
export function verifyAuditChain(rows: StoredAuditRow[]): AuditChainCheck {
  const chained = [...rows]
    .filter((row) => row.sequence != null)
    .sort((a, b) => a.sequence - b.sequence)

  let previousHash: string | null = null
  let expectedSequence = 1

  for (const row of chained) {
    const { prevHash, rowHash, ...fields } = row

    if (
      row.sequence !== expectedSequence ||
      prevHash !== previousHash ||
      rowHash !== computeAuditRowHash(previousHash, fields)
    ) {
      return {
        brokenAtSequence: expectedSequence,
        chainedEvents: chained.length,
        ok: false,
      }
    }

    previousHash = rowHash
    expectedSequence += 1
  }

  return { chainedEvents: chained.length, ok: true }
}

export function appendChainedAuditEvent(
  existing: StoredAuditRow[],
  input: Omit<ChainedAuditFields, "sequence">,
): StoredAuditRow {
  const chained = existing.filter((row) => row.sequence != null)
  const previous = chained[chained.length - 1]
  const sequence = (previous?.sequence ?? 0) + 1
  const previousHash = previous?.rowHash ?? null
  const fields: ChainedAuditFields = { ...input, sequence }
  const rowHash = computeAuditRowHash(previousHash, fields)

  return { ...fields, prevHash: previousHash, rowHash }
}