import * as pdfjs from "pdfjs-dist"

// Offline worker bundle from pdfjs-dist (no CDN).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString()

export { pdfjs }

export async function loadPdfDocument(data: Uint8Array) {
  return pdfjs.getDocument({ data: data.slice() }).promise
}

export async function extractPageMeta(
  data: Uint8Array,
): Promise<Array<{ page: number; widthPt: number; heightPt: number }>> {
  const doc = await loadPdfDocument(data)
  const pages = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const viewport = page.getViewport({ scale: 1 })
    pages.push({
      page: i,
      widthPt: viewport.width,
      heightPt: viewport.height,
    })
  }
  await doc.destroy()
  return pages
}