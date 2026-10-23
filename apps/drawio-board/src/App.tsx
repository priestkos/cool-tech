import {
  DrawioEditor,
  type Descriptor,
  type DrawioEditorHandle,
} from "@drawio/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  createSavedDiagram,
  deleteSavedDiagram,
  loadSavedDiagrams,
  persistSavedDiagrams,
  renameSavedDiagram,
  type SavedDiagram,
  upsertSavedDiagram,
} from "@/lib/saved-diagrams"
import {
  DEFAULT_MERMAID,
  STARTER_TEMPLATES,
  type TemplateId,
} from "@/lib/templates"

function downloadDataUri(dataUri: string, filename: string) {
  const link = document.createElement("a")
  link.href = dataUri
  link.download = filename
  link.click()
}

export default function App() {
  const editorRef = useRef<DrawioEditorHandle>(null)
  const [xml, setXml] = useState<string | undefined>(
    () => STARTER_TEMPLATES[0]?.xml,
  )
  const [descriptor, setDescriptor] = useState<Descriptor | undefined>()
  const [editorRevision, setEditorRevision] = useState(0)
  const [currentXml, setCurrentXml] = useState<string | undefined>()
  const [activeTemplate, setActiveTemplate] = useState<TemplateId | null>(
    "flowchart",
  )
  const [mermaidSource, setMermaidSource] = useState(DEFAULT_MERMAID)
  const [saved, setSaved] = useState<SavedDiagram[]>(() => loadSavedDiagrams())
  const [activeSaveId, setActiveSaveId] = useState<string | null>(null)
  const [saveName, setSaveName] = useState("My diagram")
  const [renameTarget, setRenameTarget] = useState<SavedDiagram | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [inlineError, setInlineError] = useState<string | null>(null)
  const [exportBusy, setExportBusy] = useState(false)

  useEffect(() => {
    persistSavedDiagrams(saved)
  }, [saved])

  const bumpEditor = useCallback(() => {
    setEditorRevision((n) => n + 1)
  }, [])

  const openTemplate = (id: TemplateId) => {
    const template = STARTER_TEMPLATES.find((t) => t.id === id)
    if (!template) return
    setInlineError(null)
    setDescriptor(undefined)
    setXml(template.xml)
    setActiveTemplate(id)
    setActiveSaveId(null)
    bumpEditor()
  }

  const convertMermaid = () => {
    setInlineError(null)
    setXml(undefined)
    setDescriptor({ format: "mermaid", data: mermaidSource })
    setActiveTemplate(null)
    setActiveSaveId(null)
    bumpEditor()
  }

  const openSaved = (entry: SavedDiagram) => {
    setInlineError(null)
    setDescriptor(undefined)
    setXml(entry.xml)
    setActiveSaveId(entry.id)
    setSaveName(entry.name)
    setActiveTemplate(null)
    bumpEditor()
  }

  const saveCurrent = async () => {
    setInlineError(null)
    try {
      const latest =
        currentXml ?? (await editorRef.current?.getXml()) ?? xml ?? ""
      if (!latest.trim()) {
        setInlineError("Nothing to save yet — draw something in the editor first.")
        return
      }
      const entry = activeSaveId
        ? {
            ...(saved.find((s) => s.id === activeSaveId) ??
              createSavedDiagram(saveName, latest)),
            name: saveName.trim() || "Untitled diagram",
            xml: latest,
            updatedAt: Date.now(),
          }
        : createSavedDiagram(saveName, latest)
      setSaved((list) => upsertSavedDiagram(list, entry))
      setActiveSaveId(entry.id)
      await editorRef.current?.setModified(false)
    } catch (err) {
      setInlineError(
        err instanceof Error ? err.message : "Could not save this diagram.",
      )
    }
  }

  const exportDiagram = async (format: "png" | "svg") => {
    setInlineError(null)
    setExportBusy(true)
    try {
      const result = await editorRef.current?.export({ format })
      if (!result?.data) {
        setInlineError("Export returned no data. Wait for the editor to finish loading.")
        return
      }
      downloadDataUri(result.data as string, `diagram.${format}`)
    } catch (err) {
      setInlineError(
        err instanceof Error ? err.message : `Could not export ${format}.`,
      )
    } finally {
      setExportBusy(false)
    }
  }

  const confirmRename = () => {
    if (!renameTarget) return
    setSaved((list) => renameSavedDiagram(list, renameTarget.id, renameValue))
    if (activeSaveId === renameTarget.id) {
      setSaveName(renameValue.trim() || renameTarget.name)
    }
    setRenameTarget(null)
  }

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b px-4 py-4 md:px-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Diagram Desk
            </h1>
            <p className="text-sm text-muted-foreground">
              Real draw.io in React via{" "}
              <a
                className="underline underline-offset-4"
                href="https://www.drawio.com/react"
                target="_blank"
                rel="noreferrer"
              >
                @drawio/react
              </a>
              — templates, Mermaid import, local saves, PNG/SVG export.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportBusy}
              onClick={() => exportDiagram("png")}
            >
              Export PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={exportBusy}
              onClick={() => exportDiagram("svg")}
            >
              Export SVG
            </Button>
          </div>
        </div>
      </header>

      {inlineError ? (
        <Alert variant="destructive" className="mx-4 mt-4 md:mx-6">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{inlineError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-4 border-b p-4 lg:w-80 lg:border-r lg:border-b-0">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Starter templates</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {STARTER_TEMPLATES.map((template) => (
                <Button
                  key={template.id}
                  type="button"
                  variant={activeTemplate === template.id ? "default" : "outline"}
                  className="h-auto flex-col items-start gap-1 py-3 text-left"
                  onClick={() => openTemplate(template.id)}
                >
                  <span className="font-medium">{template.title}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {template.description}
                  </span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Paste Mermaid</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Textarea
                value={mermaidSource}
                onChange={(e) => setMermaidSource(e.target.value)}
                rows={7}
                className="font-mono text-xs"
                spellCheck={false}
              />
              <Button type="button" onClick={convertMermaid}>
                Convert to diagram
              </Button>
            </CardContent>
          </Card>

          <Card size="sm" className="min-h-0 flex-1">
            <CardHeader>
              <CardTitle>Saved diagrams</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="save-name">Name</Label>
                <Input
                  id="save-name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                />
                <Button type="button" onClick={saveCurrent}>
                  Save to this browser
                </Button>
              </div>
              <Separator />
              <ScrollArea className="h-48 pr-2">
                {saved.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No saves yet. Edit a diagram and tap save.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {saved.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex flex-col gap-2 rounded-lg border p-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <button
                            type="button"
                            className="text-left text-sm font-medium hover:underline"
                            onClick={() => openSaved(entry)}
                          >
                            {entry.name}
                          </button>
                          {activeSaveId === entry.id ? (
                            <Badge variant="secondary">Open</Badge>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openSaved(entry)}
                          >
                            Open
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRenameTarget(entry)
                              setRenameValue(entry.name)
                            }}
                          >
                            Rename
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSaved((list) =>
                                deleteSavedDiagram(list, entry.id),
                              )
                              if (activeSaveId === entry.id) {
                                setActiveSaveId(null)
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        <main className="relative min-h-[480px] min-w-0 flex-1 lg:min-h-0">
          <ErrorBoundary>
            <DrawioEditor
              key={editorRevision}
              ref={editorRef}
              xml={xml}
              descriptor={descriptor}
              autosave
              className="absolute inset-0 size-full border-0"
              urlParameters={{
                dark: "auto",
                ui: "min",
                noSaveBtn: true,
                saveAndExit: false,
                noExitBtn: true,
              }}
              onAutosave={(event) => {
                if (event.xml) setCurrentXml(event.xml)
              }}
              onLoad={() => setInlineError(null)}
            />
          </ErrorBoundary>
        </main>
      </div>

      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename diagram</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoFocus
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmRename}>
              Save name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
