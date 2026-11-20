import { describe, expect, test } from "bun:test"

import { VerifyRegistry } from "./verify-registry.ts"

describe("verify registry", () => {
  test("match, modified, unknown outcomes", () => {
    const registry = new VerifyRegistry()
    registry.register({
      envelopeId: "e1",
      title: "Demo",
      status: "completed",
      finishedAt: 1,
      signerCount: 2,
      signedPdfSha256: "aa".repeat(32),
    })
    expect(registry.verify("aa".repeat(32), "aa".repeat(32))).toMatchObject({
      kind: "match",
    })
    expect(registry.verify("bb".repeat(32), "aa".repeat(32))).toMatchObject({
      kind: "modified",
    })
    expect(registry.verify("cc".repeat(32), "dd".repeat(32))).toMatchObject({
      kind: "unknown",
    })
  })

  test("distinguishes a certificate hash from the signed PDF", () => {
    const signed = "aa".repeat(32)
    const certificate = "bb".repeat(32)
    const registry = new VerifyRegistry()
    registry.register({
      envelopeId: "e1",
      title: "Demo",
      status: "completed",
      finishedAt: 1,
      signerCount: 1,
      signedPdfSha256: signed,
      certificateSha256: certificate,
    })

    expect(registry.verify(signed, signed)).toMatchObject({
      kind: "match",
      fileKind: "signed-document",
    })
    expect(registry.verify(certificate, certificate)).toMatchObject({
      kind: "match",
      fileKind: "certificate",
      record: { envelopeId: "e1" },
    })
    expect(registry.verify("cc".repeat(32), certificate)).toEqual({
      kind: "modified",
      computedHash: "cc".repeat(32),
    })

    const restored = VerifyRegistry.fromJSON(registry.toJSON())
    expect(restored.lookup(certificate)?.envelopeId).toBe("e1")
    expect(restored.lookup(signed)?.signedPdfSha256).toBe(signed)
  })

  test("unknown when the claimed good hash was never registered", () => {
    const registry = new VerifyRegistry()
    registry.register({
      envelopeId: "e1",
      title: "Demo",
      status: "voided",
      finishedAt: 1,
      signerCount: 1,
      signedPdfSha256: "aa".repeat(32),
    })
    expect(registry.verify("bb".repeat(32), "ee".repeat(32))).toEqual({
      kind: "unknown",
    })
  })
})
