import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

import type { FieldRecord } from "../signudoc/field-types.ts"
import { normalizedRectToPdfRect } from "../signudoc/pdf-coords.ts"
import type { PageMeta } from "./lab-store.ts"
import type { StoredAuditRow } from "../signudoc/audit-chain.ts"

async function dataUrlToPngBytes(dataUrl: string): Promise<Uint8Array> {
  const base64 = dataUrl.split(",")[1]
  if (!base64) {
    throw new Error("Invalid drawn signature data URL.")
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function exportSignedPdf(input: {
  originalPdf: Uint8Array
  pages: PageMeta[]
  fields: FieldRecord[]
  title: string
  audit: StoredAuditRow[]
  documentHash: string
}): Promise<{ pdfBytes: Uint8Array; certificateOnly?: Uint8Array }> {
  const pdf = await PDFDocument.load(input.originalPdf)
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)

  for (const field of input.fields.filter((f) => f.submittedAt)) {
    const pageIndex = field.page - 1
    const pageMeta = input.pages[pageIndex]
    if (!pageMeta) {
      continue
    }
    const page = pdf.getPage(pageIndex)
    const rect = normalizedRectToPdfRect(field, pageMeta)

    if (
      (field.type === "signature" || field.type === "initials") &&
      field.imageDataUrl
    ) {
      const png = await dataUrlToPngBytes(field.imageDataUrl)
      const image = await pdf.embedPng(png)
      page.drawImage(image, {
        x: rect.xPt,
        y: rect.yPt,
        width: rect.widthPt,
        height: rect.heightPt,
      })
    } else if (field.value) {
      page.drawText(field.value, {
        x: rect.xPt + 2,
        y: rect.yPt + rect.heightPt / 2 - 6,
        size: Math.min(12, rect.heightPt * 0.55),
        font,
        color: rgb(0.1, 0.1, 0.15),
        maxWidth: rect.widthPt - 4,
      })
    }
  }

  const withFields = await pdf.save()

  const certDoc = await PDFDocument.create()
  const certPage = certDoc.addPage([612, 792])
  const margin = 48
  let y = 792 - margin

  const drawLine = (text: string, size = 11, useBold = false) => {
    certPage.drawText(text, {
      x: margin,
      y,
      size,
      font: useBold ? bold : font,
      color: rgb(0.15, 0.15, 0.2),
      maxWidth: 612 - margin * 2,
    })
    y -= size + 6
  }

  drawLine("SignuDoc Seal Lab — Audit Certificate", 16, true)
  drawLine(`Document: ${input.title}`)
  drawLine(`SHA-256 document hash: ${input.documentHash}`)
  drawLine("This certificate is for demonstration only — not legally binding.")
  y -= 8
  drawLine("Audit trail (chained events):", 12, true)

  for (const row of input.audit.filter((r) => r.sequence != null)) {
    drawLine(
      `${row.sequence}. ${row.event} · ${row.actorType} · ${new Date(row.createdAt * 1000).toISOString()}`,
      9,
    )
    if (row.rowHash) {
      drawLine(`   row_hash: ${row.rowHash.slice(0, 24)}…`, 8)
    }
  }

  drawLine(
    "Production SignuDoc seals finished PDFs with PAdES (CMS over the file). This lab does not apply PAdES or qualified signatures.",
    9,
  )

  const certificateBytes = await certDoc.save()

  const merged = await PDFDocument.load(withFields)
  const certLoaded = await PDFDocument.load(certificateBytes)
  const certPages = await merged.copyPages(certLoaded, certLoaded.getPageIndices())
  for (const p of certPages) {
    merged.addPage(p)
  }

  const finalBytes = await merged.save()
  return { pdfBytes: finalBytes, certificateOnly: certificateBytes }
}