import { describe, expect, test } from "bun:test"

import {
  applySignerSubmission,
  assertSignerFieldOwnership,
  createEnvelope,
  replaceSigners,
  sendEnvelope,
} from "./lab-store.ts"
import type { FieldRecord } from "../signudoc/field-types.ts"

const pages = [{ page: 1, widthPt: 612, heightPt: 792 }]

describe("lab store", () => {
  test("signer ordering and field ownership", () => {
    let env = createEnvelope({
      title: "Test",
      pdfBytes: new Uint8Array([1, 2, 3]),
      pages,
    })
    env = replaceSigners(env, [
      { name: "A", email: "a@test.com" },
      { name: "B", email: "b@test.com" },
    ])
    const orders = new Map(env.signers.map((s) => [s.id, s.order]))
    const field: FieldRecord = {
      id: "f1",
      signerId: env.signers[0]!.id,
      type: "signature",
      page: 1,
      x: 0.1,
      y: 0.1,
      width: 0.2,
      height: 0.08,
      required: true,
    }
    env = { ...env, fields: [field] }
    expect(assertSignerFieldOwnership(env, orders)).toBe(true)
    const sent = sendEnvelope(env)
    expect(sent.outbox).toHaveLength(1)
    expect(sent.envelope.signers[0]?.status).toBe("sent")
  })

  test("round-trip submission updates signer status", () => {
    let env = createEnvelope({
      title: "Test",
      pdfBytes: new Uint8Array([9]),
      pages,
    })
    env = replaceSigners(env, [{ name: "A", email: "a@test.com" }])
    env = sendEnvelope(env).envelope
    const signer = env.signers[0]!
    const updates = new Map<string, FieldRecord>()
    env = applySignerSubmission(env, signer.id, updates)
    expect(env.signers[0]?.status).toBe("completed")
    expect(env.status).toBe("completed")
  })
})