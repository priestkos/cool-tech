import { describe, expect, test } from "bun:test"

import {
  appendChainedAuditEvent,
  computeAuditRowHash,
  verifyAuditChain,
  type ChainedAuditFields,
} from "./audit-chain.ts"

function baseFields(overrides: Partial<ChainedAuditFields> = {}): ChainedAuditFields {
  return {
    actorEmail: "a@example.com",
    actorType: "signer",
    createdAt: 1_700_000_000,
    envelopeId: "env-1",
    event: "signature_submitted",
    id: "evt-1",
    ipAddress: null,
    metadata: null,
    sequence: 1,
    userAgent: "test",
    ...overrides,
  }
}

describe("audit chain", () => {
  test("build and verify intact chain", () => {
    const row1 = appendChainedAuditEvent(
      [],
      baseFields({ id: "evt-1", event: "envelope_created" }),
    )
    const row2 = appendChainedAuditEvent(
      [row1],
      baseFields({ id: "evt-2", event: "signature_submitted" }),
    )
    const check = verifyAuditChain([row1, row2])
    expect(check.ok).toBe(true)
    expect(check.chainedEvents).toBe(2)
  })

  test("tamper detection at exact broken row", () => {
    const row1 = appendChainedAuditEvent([], baseFields({ id: "evt-1" }))
    const row2 = appendChainedAuditEvent([row1], baseFields({ id: "evt-2" }))
    const tampered = {
      ...row2,
      event: "signature_submitted_tampered",
      rowHash: "f".repeat(64),
    }
    const check = verifyAuditChain([row1, tampered])
    expect(check.ok).toBe(false)
    if (!check.ok) {
      expect(check.brokenAtSequence).toBe(2)
    }
  })

  test("no false flag on intact recompute", () => {
    const prev: ChainedAuditFields = baseFields({ sequence: 1 })
    const hash = computeAuditRowHash(null, prev)
    const stored = {
      ...prev,
      prevHash: null,
      rowHash: hash,
    }
    expect(verifyAuditChain([stored]).ok).toBe(true)
  })
})