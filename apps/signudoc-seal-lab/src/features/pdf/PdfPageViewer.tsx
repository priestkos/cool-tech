import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import type { FieldRecord } from "@/signudoc/field-types.ts"
import { defaultFieldSize, type LabFieldType } from "@/signudoc/field-types.ts"
import { placeFieldAtViewportPoint } from "@/signudoc/pdf-coords.ts"

import { loadPdfDocument } from "./pdfjs.ts"

type Props = {
  pdfBytes: Uint8Array
  page: number
  fields: FieldRecord[]
  selectedSignerId: string | null
  placeMode: LabFieldType | null
  readOnly?: boolean
  onPlaceField?: (field: Omit<FieldRecord, "submittedAt">) => void
  onSelectField?: (fieldId: string) => void
  highlightSignerId?: string
}

export function PdfPageViewer({
  pdfBytes,
  page,
  fields,
  selectedSignerId,
  placeMode,
  readOnly,
  onPlaceField,
  onSelectField,
  highlightSignerId,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [viewport, setViewport] = useState({ width: 0, height: 0 })

  useEffect(() => {
    let cancelled = false

    async function render() {
      const doc = await loadPdfDocument(pdfBytes)
      const pdfPage = await doc.getPage(page)
      const scale = 1.25
      const vp = pdfPage.getViewport({ scale })
      if (cancelled) {
        await doc.destroy()
        return
      }
      setViewport({ width: vp.width, height: vp.height })
      const canvas = canvasRef.current
      if (!canvas) {
        await doc.destroy()
        return
      }
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        await doc.destroy()
        return
      }
      canvas.width = vp.width
      canvas.height = vp.height
      await pdfPage.render({ canvas, canvasContext: ctx, viewport: vp }).promise
      await doc.destroy()
    }

    void render()
    return () => {
      cancelled = true
    }
  }, [pdfBytes, page])

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (readOnly || !placeMode || !selectedSignerId || !onPlaceField) {
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const size = defaultFieldSize[placeMode]
    const placement = placeFieldAtViewportPoint({
      clientX: event.clientX - rect.left,
      clientY: event.clientY - rect.top,
      fieldHeight: size.height,
      fieldWidth: size.width,
      viewportHeight: rect.height,
      viewportWidth: rect.width,
    })

    onPlaceField({
      id: crypto.randomUUID(),
      signerId: selectedSignerId,
      type: placeMode,
      page,
      ...placement,
      required: true,
    })
  }

  const pageFields = fields.filter((f) => f.page === page)

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative mx-auto w-full max-w-3xl overflow-hidden rounded-lg border bg-white shadow-sm",
        placeMode && !readOnly ? "cursor-crosshair" : "cursor-default",
      )}
      style={{
        aspectRatio:
          viewport.width && viewport.height
            ? `${viewport.width}/${viewport.height}`
            : "8.5/11",
      }}
      onClick={handleClick}
      role="presentation"
    >
      <canvas ref={canvasRef} className="h-full w-full" />
      {pageFields.map((field) => {
        const dimmed =
          highlightSignerId && field.signerId !== highlightSignerId
        return (
          <button
            key={field.id}
            type="button"
            className={cn(
              "absolute rounded border-2 border-dashed text-[10px] font-medium",
              field.submittedAt
                ? "border-emerald-500/70 bg-emerald-50/80 text-emerald-900"
                : "border-primary/60 bg-primary/10 text-primary",
              dimmed && "opacity-30",
            )}
            style={{
              left: `${field.x * 100}%`,
              top: `${field.y * 100}%`,
              width: `${field.width * 100}%`,
              height: `${field.height * 100}%`,
            }}
            onClick={(e) => {
              e.stopPropagation()
              onSelectField?.(field.id)
            }}
            aria-label={`${field.type} field`}
          >
            {field.type}
            {field.value ? `: ${field.value.slice(0, 12)}` : null}
          </button>
        )
      })}
    </div>
  )
}