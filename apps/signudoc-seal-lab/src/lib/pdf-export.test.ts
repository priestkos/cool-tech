import { describe, expect, test } from "bun:test"
import { PDFDocument } from "pdf-lib"

import { exportSignedPdf } from "./pdf-export.ts"
import { appendChainedAuditEvent } from "../signudoc/audit-chain.ts"
import { sha256Hex } from "./sha256.ts"

describe("pdf export", () => {
  test("appends certificate page and embeds typed signature", async () => {
    const doc = await PDFDocument.create()
    const page = doc.addPage([400, 500])
    page.drawText("Sample contract body", { x: 40, y: 460, size: 12 })
    const original = await doc.save()

  const audit = [
    appendChainedAuditEvent([], {
      actorEmail: "s@test.com",
      actorType: "signer",
      createdAt: 1,
      envelopeId: "env",
      event: "envelope_created",
      id: "1",
      ipAddress: null,
      metadata: null,
      userAgent: "test",
    }),
  ]

    const { pdfBytes } = await exportSignedPdf({
      originalPdf: original,
      pages: [{ page: 1, widthPt: 400, heightPt: 500 }],
      fields: [
        {
          id: "f1",
          signerId: "s1",
          type: "signature",
          page: 1,
          x: 0.1,
          y: 0.7,
          width: 0.35,
          height: 0.08,
          required: true,
          value: "Alex Rivera",
          inputMethod: "typed",
          submittedAt: 2,
        },
      ],
      title: "Sample",
      audit,
      documentHash: await sha256Hex(original),
    })

    const out = await PDFDocument.load(pdfBytes)
    expect(out.getPageCount()).toBe(2)
    const hash = await sha256Hex(pdfBytes)
    expect(hash).toHaveLength(64)
  })
})