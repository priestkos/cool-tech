import { useCallback, useEffect, useId, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  studioImage,
  studioOutline,
  studioPdf,
  studioRender,
  studioValidate,
} from "@/features/studio/api"
import { DEFAULT_DRAFT, type CardDraft } from "../shared/card-draft"
import { cn } from "@/lib/utils"

type Diagnostic = {
  code: string
  severity: string
  message: string
  path: string
  clients?: string[]
  fix?: string
  see?: string
}

function severityVariant(severity: string) {
  switch (severity) {
    case "error":
      return "destructive" as const
    case "warning":
      return "secondary" as const
    default:
      return "outline" as const
  }
}

export default function App() {
  const [draft, setDraft] = useState<CardDraft>(DEFAULT_DRAFT)
  const [tab, setTab] = useState("email")
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([])
  const [valid, setValid] = useState(true)
  const [outlineText, setOutlineText] = useState("")
  const [emailHtml, setEmailHtml] = useState("")
  const [pageHtml, setPageHtml] = useState("")
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFormat, setImageFormat] = useState<"png" | "svg">("png")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const plantLayoutId = useId()
  const plantEmailFixId = useId()

  const refresh = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const [validation, outlineRes, emailRes, pageRes, pdfRes, imgRes] =
        await Promise.all([
          studioValidate(draft),
          studioOutline(draft),
          studioRender("email", draft),
          studioRender("page", draft),
          studioPdf(draft),
          studioImage(draft, imageFormat),
        ])

      if (validation.ok && validation.diagnostics) {
        setValid(Boolean(validation.valid))
        setDiagnostics(validation.diagnostics)
      } else {
        setError(validation.message ?? "Validation failed")
      }

      if (outlineRes.ok && outlineRes.outline) {
        setOutlineText(outlineRes.outline)
      }

      if (emailRes.ok && emailRes.html) {
        setEmailHtml(emailRes.html)
      }
      if (pageRes.ok && pageRes.html) {
        setPageHtml(pageRes.html)
      }

      if (pdfRes.ok && pdfRes.pdfBase64) {
        const bytes = Uint8Array.from(atob(pdfRes.pdfBase64), (c) =>
          c.charCodeAt(0),
        )
        const blob = new Blob([bytes], { type: "application/pdf" })
        setPdfUrl((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev)
          }
          return URL.createObjectURL(blob)
        })
      }

      if (imgRes.ok && imgRes.imageBase64) {
        const mime = imageFormat === "svg" ? "image/svg+xml" : "image/png"
        const bytes = Uint8Array.from(atob(imgRes.imageBase64), (c) =>
          c.charCodeAt(0),
        )
        const blob = new Blob([bytes], { type: mime })
        setImageUrl((prev) => {
          if (prev) {
            URL.revokeObjectURL(prev)
          }
          return URL.createObjectURL(blob)
        })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refresh failed")
    } finally {
      setBusy(false)
    }
  }, [draft, imageFormat])

  useEffect(() => {
    const timer = setTimeout(() => {
      void refresh()
    }, 280)
    return () => clearTimeout(timer)
  }, [refresh])

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl)
      }
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl)
      }
    }
  }, [pdfUrl, imageUrl])

  function update<K extends keyof CardDraft>(key: K, value: CardDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const previewHtml = tab === "email" ? emailHtml : tab === "web" ? pageHtml : ""

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Hyper Elements Studio
            </h1>
            <p className="text-muted-foreground text-sm">
              Offline demo of{" "}
              <a
                className="underline underline-offset-2"
                href="https://hyperelements.dev/"
                rel="noreferrer"
                target="_blank"
              >
                Hyper Elements
              </a>{" "}
              (MIT · Unlayer) — pinned{" "}
              <code className="text-xs">@hyper-elements/react@0.3.1</code>. No
              email-client emulator packages.
            </p>
          </div>
          <Badge variant={valid ? "secondary" : "destructive"}>
            {valid ? "Valid template" : "Has errors"}
            {busy ? " · updating…" : ""}
          </Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Card content</CardTitle>
            <CardDescription>
              Shared tree wrapped in Email, Page, Document, and Canvas roots.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="heading">Heading</Label>
              <Input
                id="heading"
                value={draft.heading}
                onChange={(e) => update("heading", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                rows={4}
                value={draft.body}
                onChange={(e) => update("body", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="btn">Button label</Label>
              <Input
                id="btn"
                value={draft.buttonLabel}
                onChange={(e) => update("buttonLabel", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="href">Button href</Label>
              <Input
                id="href"
                value={draft.buttonHref}
                onChange={(e) => update("buttonHref", e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div className="space-y-0.5">
                <Label htmlFor={plantLayoutId}>Plant layout error</Label>
                <p className="text-muted-foreground text-xs">
                  Adds <code className="text-[0.7rem]">marginBottom</code> on the
                  body text (validation error + path).
                </p>
              </div>
              <Switch
                id={plantLayoutId}
                checked={draft.plantLayoutError}
                onCheckedChange={(v) => update("plantLayoutError", Boolean(v))}
              />
            </div>
            <div className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div className="space-y-0.5">
                <Label htmlFor={plantEmailFixId}>Plant email-client fix</Label>
                <p className="text-muted-foreground text-xs">
                  Uses a web-font-only stack on Email so{" "}
                  <code className="text-[0.7rem]">render()</code> reports a{" "}
                  <code className="text-[0.7rem]">fix</code> for clients.
                </p>
              </div>
              <Switch
                id={plantEmailFixId}
                checked={draft.plantEmailFix}
                onCheckedChange={(v) => update("plantEmailFix", Boolean(v))}
              />
            </div>
            <Button type="button" variant="outline" onClick={() => void refresh()}>
              Refresh outputs
            </Button>
          </CardContent>
        </Card>

        <Card className="min-h-[420px]">
          <CardHeader>
            <CardTitle>Outputs</CardTitle>
            <CardDescription>
              Rendered locally via Vite middleware — zero runtime network fetches
              for fonts or images.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full flex-wrap">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="web">Web</TabsTrigger>
                <TabsTrigger value="pdf">PDF</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
              </TabsList>
              <TabsContent value="email" className="mt-3">
                <PreviewFrame title="Email HTML" html={emailHtml} />
              </TabsContent>
              <TabsContent value="web" className="mt-3">
                <PreviewFrame title="Page HTML" html={pageHtml} />
              </TabsContent>
              <TabsContent value="pdf" className="mt-3">
                {pdfUrl ? (
                  <iframe
                    title="PDF preview"
                    src={pdfUrl}
                    className="h-[min(60vh,520px)] w-full rounded-md border bg-white"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No PDF yet.</p>
                )}
              </TabsContent>
              <TabsContent value="image" className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={imageFormat === "png" ? "default" : "outline"}
                    onClick={() => setImageFormat("png")}
                  >
                    PNG
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={imageFormat === "svg" ? "default" : "outline"}
                    onClick={() => setImageFormat("svg")}
                  >
                    SVG
                  </Button>
                </div>
                {imageUrl ? (
                  <img
                    alt="Canvas render"
                    src={imageUrl}
                    className="max-h-[min(60vh,520px)] w-full rounded-md border object-contain bg-white"
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No image yet.</p>
                )}
              </TabsContent>
            </Tabs>
            {error ? (
              <p className="text-destructive mt-3 text-sm" role="alert">
                {error}
              </p>
            ) : null}
            {tab === "email" || tab === "web" ? (
              <p className="text-muted-foreground mt-2 sr-only">
                Previewing {previewHtml.slice(0, 40)}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation</CardTitle>
              <CardDescription>
                Severity, code, path, message, clients, and actionable fix
                strings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[220px] pr-3">
                <ul className="space-y-3">
                  {diagnostics.length === 0 ? (
                    <li className="text-muted-foreground text-sm">
                      No diagnostics.
                    </li>
                  ) : (
                    diagnostics.map((d, i) => (
                      <li
                        key={`${d.code}-${d.path}-${i}`}
                        className="rounded-md border p-2 text-sm"
                      >
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Badge variant={severityVariant(d.severity)}>
                            {d.severity}
                          </Badge>
                          <code className="text-xs">{d.code}</code>
                        </div>
                        <p>{d.message}</p>
                        <p className="text-muted-foreground text-xs">
                          <span className="font-medium">path:</span> {d.path}
                        </p>
                        {d.clients?.length ? (
                          <p className="text-muted-foreground text-xs">
                            <span className="font-medium">clients:</span>{" "}
                            {d.clients.join(", ")}
                          </p>
                        ) : null}
                        {d.fix ? (
                          <p className="mt-1 text-xs">
                            <span className="font-medium">fix:</span> {d.fix}
                          </p>
                        ) : d.severity === "error" ? (
                          <p className="mt-1 text-xs">
                            <span className="font-medium">fix:</span>{" "}
                            {d.message}
                          </p>
                        ) : null}
                        {d.see ? (
                          <p className="text-muted-foreground mt-1 text-xs">
                            <span className="font-medium">see:</span> {d.see}
                          </p>
                        ) : null}
                      </li>
                    ))
                  )}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Outline inspector</CardTitle>
              <CardDescription>
                <code className="text-xs">outline()</code> layout text — blocks,
                widths, and words.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[220px]">
                <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono">
                  {outlineText || "—"}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="text-muted-foreground border-t px-4 py-3 text-center text-xs">
        Hyper Elements © 2025 Unlayer, Inc. (MIT) ·{" "}
        <a
          className="underline"
          href="https://github.com/hyper-elements/hyper-elements"
          rel="noreferrer"
          target="_blank"
        >
          github.com/hyper-elements/hyper-elements
        </a>{" "}
        · release v0.3.1 / commit 571ec52 — bundled Arimo (Apache-2.0, Croscore).
      </footer>
    </div>
  )
}

function PreviewFrame({ title, html }: { title: string; html: string }) {
  if (!html) {
    return <p className="text-muted-foreground text-sm">No HTML yet.</p>
  }
  return (
    <iframe
      title={title}
      sandbox=""
      srcDoc={html}
      className={cn(
        "h-[min(60vh,520px)] w-full rounded-md border bg-white",
      )}
    />
  )
}
