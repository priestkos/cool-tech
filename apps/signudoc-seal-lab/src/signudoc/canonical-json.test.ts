import { describe, expect, test } from "bun:test"

import { canonicalJson } from "./canonical-json.ts"
import { computeAuditRowHash, type ChainedAuditFields } from "./audit-chain.ts"

describe("canonical json", () => {
  test("sorts object keys and drops undefined", () => {
    expect(canonicalJson({ b: 1, a: 2, c: undefined })).toBe('{"a":2,"b":1}')
    expect(canonicalJson({ b: 1, a: 2 })).toBe(canonicalJson({ a: 2, b: 1 }))
  })

  test("keeps null and canonicalizes nested objects", () => {
    expect(
      canonicalJson({
        z: { b: true, a: [3, { d: null, c: "a\"b" }] },
        m: null,
      }),
    ).toBe('{"m":null,"z":{"a":[3,{"c":"a\\"b","d":null}],"b":true}}')
  })

  test("encodes scalars the same way JSON does", () => {
    expect(canonicalJson(undefined)).toBe("null")
    expect(canonicalJson(1.5)).toBe("1.5")
    expect(canonicalJson("café")).toBe('"café"')
  })

  test("audit row hash ignores metadata key insertion order", () => {
    const base = {
      actorEmail: "a@example.com",
      actorType: "signer" as const,
      createdAt: 1_700_000_000,
      envelopeId: "env-1",
      event: "signature_submitted",
      id: "evt-1",
      ipAddress: null,
      metadata: { signerId: "s1", fieldCount: 2 },
      sequence: 1,
      userAgent: "test",
    } satisfies ChainedAuditFields

    const reordered: ChainedAuditFields = {
      userAgent: base.userAgent,
      sequence: base.sequence,
      metadata: { fieldCount: 2, signerId: "s1" },
      ipAddress: base.ipAddress,
      id: base.id,
      event: base.event,
      envelopeId: base.envelopeId,
      createdAt: base.createdAt,
      actorType: base.actorType,
      actorEmail: base.actorEmail,
    }

    expect(computeAuditRowHash(null, base)).toBe(computeAuditRowHash(null, reordered))
    expect(computeAuditRowHash("abc", base)).not.toBe(computeAuditRowHash(null, base))
  })
})
