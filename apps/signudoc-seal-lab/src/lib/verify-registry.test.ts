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
})