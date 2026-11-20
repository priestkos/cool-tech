import { describe, expect, test } from "bun:test"
import { PDFDocument } from "pdf-lib"

import {
  addField,
  applySignerSubmission,
  createEnvelope,
  replaceSigners,
  sendEnvelope,
} from "./lab-store.ts"
import { exportSignedPdf } from "./pdf-export.ts"
import { sha256Hex } from "./sha256.ts"

describe("signing flow integration", () => {
  test("two signers complete and export sealed pdf", async () => {
    const doc = await PDFDocument.create()
    doc.addPage([400, 500])
    const original = await doc.save()

    let envelope = createEnvelope({
      title: "Flow",
      pdfBytes: original,
      pages: [{ page: 1, widthPt: 400, heightPt: 500 }],
    })
    envelope = replaceSigners(envelope, [
      { name: "A", email: "a@test.com" },
      { name: "B", email: "b@test.com" },
    ])
    const a = envelope.signers[0]!
    const b = envelope.signers[1]!
    envelope = addField(envelope, {
      id: "f1",
      signerId: a.id,
      type: "signature",
      page: 1,
      x: 0.1,
      y: 0.7,
      width: 0.3,
      height: 0.08,
      required: true,
      value: "A Signer",
      inputMethod: "typed",
    })
    envelope = sendEnvelope(envelope).envelope
    const tokenA = envelope.signers.find((s) => s.order === 0)?.token!

    envelope = applySignerSubmission(
      envelope,
      a.id,
      new Map([
        [
          "f1",
          {
            id: "f1",
            signerId: a.id,
            type: "signature",
            page: 1,
            x: 0.1,
            y: 0.7,
            width: 0.3,
            height: 0.08,
            required: true,
            value: "A Signer",
            inputMethod: "typed",
          },
        ],
      ]),
    )

    expect(envelope.signers.find((s) => s.id === b.id)?.token).toBeTruthy()

    envelope = addField(envelope, {
      id: "f2",
      signerId: b.id,
      type: "signature",
      page: 1,
      x: 0.1,
      y: 0.5,
      width: 0.3,
      height: 0.08,
      required: true,
    })

    const updatesB = new Map([
      [
        "f2",
        {
          id: "f2",
          signerId: b.id,
          type: "signature" as const,
          page: 1,
          x: 0.1,
          y: 0.5,
          width: 0.3,
          height: 0.08,
          required: true,
          value: "B Signer",
          inputMethod: "typed" as const,
        },
      ],
    ])
    envelope = applySignerSubmission(envelope, b.id, updatesB)
    expect(envelope.status).toBe("completed")

    const { pdfBytes } = await exportSignedPdf({
      originalPdf: envelope.pdfBytes,
      pages: envelope.pages,
      fields: envelope.fields,
      title: envelope.title,
      audit: envelope.audit,
      documentHash: await sha256Hex(envelope.pdfBytes),
    })

    const out = await PDFDocument.load(pdfBytes)
    expect(out.getPageCount()).toBe(2)
    expect(tokenA.length).toBeGreaterThan(10)
  })
})