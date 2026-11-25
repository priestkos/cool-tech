import { describe, expect, test } from "bun:test"

import {
  addField,
  applySignerSubmission,
  assertSignerFieldOwnership,
  auditChainView,
  createEnvelope,
  replaceFields,
  replaceSigners,
  sendEnvelope,
  tamperAuditRow,
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
    expect(auditChainView(env, null).ok).toBe(true)
  })

  test("refuses to send an envelope with no signers", () => {
    const env = createEnvelope({
      title: "Empty",
      pdfBytes: new Uint8Array([1]),
      pages,
    })
    expect(() => sendEnvelope(env)).toThrow(
      "Add at least one signer before sending.",
    )
  })

  test("normalizes signer email and keeps identity across edits", () => {
    let env = createEnvelope({
      title: "Test",
      pdfBytes: new Uint8Array([1]),
      pages,
    })
    env = replaceSigners(env, [{ name: "Ada", email: "ada@test.com" }])
    const sent = sendEnvelope(env).envelope
    const before = sent.signers[0]!
    env = replaceSigners(sent, [{ name: "  Ada Lovelace  ", email: "  ADA@TEST.COM " }])
    expect(env.signers).toHaveLength(1)
    expect(env.signers[0]).toMatchObject({
      id: before.id,
      name: "Ada Lovelace",
      email: "ada@test.com",
      status: "sent",
      token: before.token,
      order: 0,
    })
  })

  test("field replacement keeps submitted values and rejects unknown signers", () => {
    let env = createEnvelope({
      title: "Test",
      pdfBytes: new Uint8Array([1]),
      pages,
    })
    env = replaceSigners(env, [{ name: "A", email: "a@test.com" }])
    const signerId = env.signers[0]!.id
    env = addField(env, {
      id: "f1",
      signerId,
      type: "signature",
      page: 1,
      x: 0.1,
      y: 0.2,
      width: 0.2,
      height: 0.08,
      required: true,
    })
    env = {
      ...env,
      fields: [{ ...env.fields[0]!, value: "kept", submittedAt: 5 }],
    }
    env = replaceFields(env, [
      {
        id: "f1",
        signerId,
        type: "signature",
        page: 1,
        x: 0.4,
        y: 0.2,
        width: 0.2,
        height: 0.08,
        required: true,
      },
    ])
    expect(env.fields[0]).toMatchObject({ x: 0.4, value: "kept", submittedAt: 5 })
    expect(assertSignerFieldOwnership(env, new Map())).toBe(false)
  })

  test("first signer hands off without completing the envelope", () => {
    let env = createEnvelope({
      title: "Test",
      pdfBytes: new Uint8Array([1]),
      pages,
    })
    env = replaceSigners(env, [
      { name: "A", email: "a@test.com" },
      { name: "B", email: "b@test.com" },
    ])
    env = sendEnvelope(env).envelope
    const first = env.signers.find((s) => s.order === 0)!
    const second = env.signers.find((s) => s.order === 1)!
    expect(first.token).toBeTruthy()
    expect(second.token).toBeNull()

    env = applySignerSubmission(env, first.id, new Map())
    expect(env.status).toBe("out_for_signature")
    expect(env.signers.find((s) => s.id === first.id)).toMatchObject({
      status: "completed",
      token: null,
    })
    const next = env.signers.find((s) => s.id === second.id)!
    expect(next.status).toBe("sent")
    expect(next.token).toBeTruthy()
    expect(next.token).not.toBe(first.token)
    expect(auditChainView(env, null).ok).toBe(true)
  })

  test("tamper edit and delete fail the chain at the affected sequence", () => {
    let env = createEnvelope({
      title: "Test",
      pdfBytes: new Uint8Array([1]),
      pages,
    })
    env = replaceSigners(env, [{ name: "A", email: "a@test.com" }])
    env = sendEnvelope(env).envelope
    env = applySignerSubmission(env, env.signers[0]!.id, new Map())
    expect(env.audit.map((row) => row.sequence)).toEqual([1, 2, 3, 4])
    expect(auditChainView(env, null).ok).toBe(true)

    const edited = auditChainView(env, tamperAuditRow(env.audit, 3, "edit"))
    expect(edited.ok).toBe(false)
    if (!edited.ok) {
      expect(edited.brokenAtSequence).toBe(3)
    }

    const deleted = auditChainView(env, tamperAuditRow(env.audit, 2, "delete"))
    expect(deleted.ok).toBe(false)
    if (!deleted.ok) {
      expect(deleted.brokenAtSequence).toBe(2)
    }
  })
})
