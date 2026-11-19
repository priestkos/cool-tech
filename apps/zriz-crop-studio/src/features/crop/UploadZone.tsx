import { useId, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { validateUploadFiles } from "./uploadValidation"

type Props = {
  onFile: (file: File) => void
  onSample: () => void
}

export function UploadZone({ onFile, onSample }: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const acceptFile = (files: FileList | null) => {
    if (!files) return
    const result = validateUploadFiles(files)
    if (!result.ok) {
      setError(result.reason)
      return
    }
    setError(null)
    onFile(result.file)
  }

  return (
    <div className="space-y-3">
      <Label htmlFor={inputId} className="text-sm font-medium">
        Photo source
      </Label>
      <div
        className={`rounded-xl border border-dashed p-4 transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/30"
        }`}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          acceptFile(e.dataTransfer.files)
        }}
      >
        <p className="text-muted-foreground mb-3 text-sm">
          Drag a photo here or choose a file. Images stay in the browser.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
            Upload photo
          </Button>
          <Button type="button" variant="outline" onClick={onSample}>
            Use sample image
          </Button>
        </div>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="sr-only"
          onChange={(e) => acceptFile(e.target.files)}
        />
      </div>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}