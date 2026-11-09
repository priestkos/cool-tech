import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useId, useRef } from "react"

type Props = {
  onFiles: (files: { findingsJson?: string; ledgerJson?: string; reportMd?: string }) => void
}

export function FileDropZone({ onFiles }: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
  <section
    aria-labelledby={`${inputId}-label`}
    className="border-border/70 bg-card/40 rounded-lg border border-dashed p-4"
    onDragOver={(event) => {
      event.preventDefault()
    }}
    onDrop={(event) => {
      event.preventDefault()
      void ingestFileList(event.dataTransfer.files, onFiles)
    }}
  >
    <Label id={`${inputId}-label`} className="text-sm font-medium">
      Drop audit artifacts
    </Label>
    <p className="text-muted-foreground mt-1 text-xs">
      Accepts findings.json, coverage-ledger.json, and REPORT.md. Parsed offline with vendored validators.
    </p>
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      multiple
      accept=".json,.md,application/json,text/markdown"
      className="sr-only"
      onChange={(event) => {
        const list = event.target.files
        if (list) void ingestFileList(list, onFiles)
      }}
    />
    <Button
      type="button"
      variant="outline"
      className="mt-3"
      onClick={() => inputRef.current?.click()}
    >
      Choose files
    </Button>
  </section>
  )
}

async function ingestFileList(
  list: FileList,
  onFiles: Props["onFiles"]
) {
  const payload: { findingsJson?: string; ledgerJson?: string; reportMd?: string } = {}
  for (const file of list) {
    const name = file.name.toLowerCase()
    const text = await file.text()
    if (name.includes("findings") && name.endsWith(".json")) {
      payload.findingsJson = text
    } else if (name.includes("coverage") && name.endsWith(".json")) {
      payload.ledgerJson = text
    } else if (name.endsWith(".md")) {
      payload.reportMd = text
    }
  }
  onFiles(payload)
}
