import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { exportBoardsObj } from "./export"
import type { BoardLabState } from "./useBoardLab"

type Props = {
  state: BoardLabState
  onDraft: (field: "draftLength" | "draftWidth" | "thicknessDraft", value: string) => void
  onThicknessLive: (value: string) => void
  onApplyThickness: () => void
  onExportJson: () => string
  onImportJson: (raw: string) => void
  onExportObj: () => void
  onClear: () => void
}

export function Toolbar({
  state,
  onDraft,
  onThicknessLive,
  onApplyThickness,
  onExportJson,
  onImportJson,
  onExportObj,
  onClear,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const download = (filename: string, mime: string, body: string) => {
    const blob = new Blob([body], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm">
      <CreditHeading />
      <DraftDimensions state={state} onDraft={onDraft} />
      {state.tool === "pushpull" && (
        <div className="grid gap-2">
          <Label htmlFor="thickness">Push/Pull thickness (in)</Label>
          <DraftInput
            id="thickness"
            value={state.thicknessDraft}
            onChange={onThicknessLive}
          />
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Live thickness: {state.thicknessDraft || "—"} in
          </p>
          <Button type="button" size="sm" onClick={onApplyThickness}>
            Commit thickness
          </Button>
        </div>
      )}
      {state.message ? (
        <p className="text-xs text-muted-foreground" role="status">
          {state.message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => download("benchup-board-lab.json", "application/json", onExportJson())}
        >
          Save JSON
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileRef.current?.click()}
        >
          Load JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            onImportJson(await file.text())
            e.target.value = ""
          }}
        />
        <Button type="button" size="sm" variant="outline" onClick={onExportObj}>
          Export OBJ
        </Button>
        <Button type="button" size="sm" variant="destructive" onClick={onClear}>
          Clear
        </Button>
      </div>
    </div>
  )
}

function DraftDimensions({
  state,
  onDraft,
}: {
  state: BoardLabState
  onDraft: Props["onDraft"]
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="grid gap-1">
        <Label htmlFor="length">Length (in / ft)</Label>
        <DraftInput
          id="length"
          value={state.draftLength}
          onChange={(v) => onDraft("draftLength", v)}
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="width">Width (in / ft)</Label>
        <DraftInput
          id="width"
          value={state.draftWidth}
          onChange={(v) => onDraft("draftWidth", v)}
        />
      </div>
    </div>
  )
}

function CreditHeading() {
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      <p>
        Independent three.js lab inspired by{" "}
        <a
          href="https://benchup3d.github.io/editor/"
          className="text-primary underline-offset-2 hover:underline"
          rel="noreferrer"
          target="_blank"
        >
          BenchUp
        </a>{" "}
        (not the official WASM editor).
      </p>
    </div>
  )
}

function DraftInput({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      inputMode="decimal"
      autoComplete="off"
    />
  )
}

export function triggerObjDownload(boards: Parameters<typeof exportBoardsObj>[0]) {
  const body = exportBoardsObj(boards)
  const blob = new Blob([body], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "benchup-board-lab.obj"
  a.click()
  URL.revokeObjectURL(url)
}
