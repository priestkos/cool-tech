import { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { SAMPLES, type SampleId } from "@/lib/samples.ts"
import {
  buildFileDiffViews,
  categorySectionHint,
  SEVERITY_ORDER,
  severityKey,
  type SeverityKey,
} from "@/lib/diff-view"
import type { AnalyzeResponse, ReviewResponse } from "@/lib/api-types.ts"
import { ChevronDownIcon, ExternalLinkIcon } from "lucide-react"

type StatusResponse = {
  ocrVersion: string
  gitVersion: string
  realModeAvailable: boolean
  model?: string
}

const MAX_DIFF_BYTES = 100 * 1024

const PASTED_DIFF_EXAMPLE = [
  "diff --git a/src/greet.ts b/src/greet.ts",
  "index 850ea7a..dcb7b17 100644",
  "--- a/src/greet.ts",
  "+++ b/src/greet.ts",
  "@@ -1,3 +1,3 @@",
  " export function greet(name: string) {",
  '-  return "Hello";',
  '+  return "Hello, " + name;',
  " }",
].join("\n")

export default function App() {
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [inputMode, setInputMode] = useState<"sample" | "paste">("sample")
  const [sampleId, setSampleId] = useState<SampleId>("sql-injection")
  const [pastedDiff, setPastedDiff] = useState("")
  const [analyze, setAnalyze] = useState<AnalyzeResponse | null>(null)
  const [review, setReview] = useState<ReviewResponse | null>(null)
  const [severityFilter, setSeverityFilter] = useState<Set<SeverityKey>>(
    () => new Set(SEVERITY_ORDER),
  )
  const [loadingAnalyze, setLoadingAnalyze] = useState(false)
  const [loadingReview, setLoadingReview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mockMode = !status?.realModeAvailable

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data: StatusResponse) => setStatus(data))
      .catch(() => setError("Could not reach API. Run bun run dev."))
  }, [])

  const requestBody = useMemo(() => {
    if (inputMode === "sample") return { sampleId }
    if (!pastedDiff.trim()) return null
    return { diff: pastedDiff }
  }, [inputMode, pastedDiff, sampleId])

  const diffBytes = useMemo(
    () => new TextEncoder().encode(pastedDiff).byteLength,
    [pastedDiff],
  )

  const runAnalyze = useCallback(async () => {
    if (!requestBody) {
      setError("Paste a unified diff or pick a sample.")
      return
    }
    setLoadingAnalyze(true)
    setError(null)
    setReview(null)
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Analyze failed")
      setAnalyze(data as AnalyzeResponse)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analyze failed")
      setAnalyze(null)
    } finally {
      setLoadingAnalyze(false)
    }
  }, [requestBody])

  const runReview = useCallback(async () => {
    if (!requestBody) {
      setError("Paste a unified diff or pick a sample.")
      return
    }
    setLoadingReview(true)
    setError(null)
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Review failed")
      setReview(data as ReviewResponse)
      if (!analyze) {
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })
        const analyzeData = await analyzeRes.json()
        if (analyzeRes.ok) setAnalyze(analyzeData as AnalyzeResponse)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review failed")
    } finally {
      setLoadingReview(false)
    }
  }, [analyze, requestBody])

  const visibleComments = useMemo(() => {
    if (!review?.comments) return []
    return review.comments.filter((c) => severityFilter.has(severityKey(c)))
  }, [review, severityFilter])

  const severityCounts = useMemo(() => {
    const counts: Record<SeverityKey, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      unrated: 0,
    }
    for (const c of review?.comments ?? []) {
      counts[severityKey(c)] += 1
    }
    return counts
  }, [review])

  const fileViews = useMemo(
    () => (analyze ? buildFileDiffViews(analyze.unifiedDiff) : []),
    [analyze],
  )

  const toggleSeverity = (key: SeverityKey) => {
    setSeverityFilter((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Open Code Review Playground
            </h1>
            <p className="text-sm text-muted-foreground">
              Rule matching from the real OCR CLI; review comments are sample
              fixtures unless real mode is enabled.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <a
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
              href="https://github.com/alibaba/open-code-review"
              target="_blank"
              rel="noreferrer"
            >
              Repo <ExternalLinkIcon className="size-3.5" />
            </a>
            <a
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
              href="https://open-codereview.ai/docs"
              target="_blank"
              rel="noreferrer"
            >
              Docs <ExternalLinkIcon className="size-3.5" />
            </a>
            <a
              className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
              href="https://x.com/thisdudelikesAI/status/2115010135588589932"
              target="_blank"
              rel="noreferrer"
            >
              X post <ExternalLinkIcon className="size-3.5" />
            </a>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 pb-4 text-xs text-muted-foreground">
          {status && (
            <>
              <Badge variant="outline">{status.ocrVersion}</Badge>
              <Badge variant="outline">{status.gitVersion}</Badge>
              <Badge variant={mockMode ? "secondary" : "default"}>
                {mockMode ? "MOCK" : "REAL"}
              </Badge>
              <span>
                {mockMode
                  ? "Preview and rule groups come from ocr on this machine; review comments use bundled sample JSON."
                  : `Live reviews via ocr review (model: ${status.model}).`}
              </span>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>
                Samples are short planted bugs. Pasted diffs are analyze-only in
                mock mode.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={inputMode === "sample" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setInputMode("sample")}
                >
                  Sample
                </Button>
                <Button
                  type="button"
                  variant={inputMode === "paste" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setInputMode("paste")}
                >
                  Paste diff
                </Button>
              </div>

              {inputMode === "sample" ? (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="sample">Sample diff</Label>
                  <Select
                    value={sampleId}
                    onValueChange={(v) => setSampleId(v as SampleId)}
                  >
                    <SelectTrigger id="sample" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SAMPLES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {SAMPLES.find((s) => s.id === sampleId)?.description}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="diff">Unified diff (max 100 KB, 10 files)</Label>
                  <Textarea
                    id="diff"
                    value={pastedDiff}
                    onChange={(e) => setPastedDiff(e.target.value)}
                    rows={12}
                    placeholder={PASTED_DIFF_EXAMPLE}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    {diffBytes.toLocaleString()} bytes · OCR only reviews the
                    hunks you paste, not whole files.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPastedDiff(PASTED_DIFF_EXAMPLE)}
                  >
                    Insert tiny example
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={loadingAnalyze}
                  onClick={() => void runAnalyze()}
                >
                  {loadingAnalyze ? "Analyzing…" : "Analyze rules & preview"}
                </Button>
                <Button
                  type="button"
                  disabled={loadingReview || diffBytes > MAX_DIFF_BYTES}
                  onClick={() => void runReview()}
                >
                  {loadingReview ? "Running review…" : "Run review"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {review?.summary && (
            <Card>
              <CardHeader>
                <CardTitle>Token readout</CardTitle>
                <CardDescription>
                  {review.mock || mockMode ? "Sample fixture totals" : "Live ocr review summary"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span>{review.summary.total_tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Input</span>
                  <span>{review.summary.input_tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Output</span>
                  <span>{review.summary.output_tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Elapsed</span>
                  <span>{review.summary.elapsed}</span>
                </div>
                <Badge variant="outline" className="mt-2 w-fit">
                  {review.mock || mockMode ? "sample" : "live"}
                </Badge>
              </CardContent>
            </Card>
          )}

          {review && (
            <Card>
              <CardHeader>
                <CardTitle>Severity filter</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {SEVERITY_ORDER.map((key) => (
                  <Button
                    key={key}
                    type="button"
                    size="sm"
                    variant={severityFilter.has(key) ? "default" : "outline"}
                    onClick={() => toggleSeverity(key)}
                  >
                    {key} ({severityCounts[key]})
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {review?.fixtureNote && (
            <Alert>
              <AlertTitle>Mock review comments</AlertTitle>
              <AlertDescription>{review.fixtureNote}</AlertDescription>
            </Alert>
          )}

          {analyze?.pastedDiff && mockMode && !review && (
            <Alert>
              <AlertTitle>Analyze-only for pasted diffs</AlertTitle>
              <AlertDescription>
                Rule groups and preview are live OCR output. There is no recorded
                review fixture for arbitrary diffs — set OCR_LLM_URL,
                OCR_LLM_TOKEN, and OCR_LLM_MODEL to run a live review.
              </AlertDescription>
            </Alert>
          )}

          {analyze && (
            <Card>
              <CardHeader>
                <CardTitle>Diff</CardTitle>
                <CardDescription>
                  {analyze.preview.reviewable_count} reviewable file(s) ·{" "}
                  {analyze.preview.total_insertions}+ / {analyze.preview.total_deletions}−
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {fileViews.map((file) => (
                  <div key={file.path} className="flex flex-col gap-2">
                    <div className="font-mono text-sm font-medium">{file.path}</div>
                    <div className="overflow-x-auto rounded-md border bg-muted/30 font-mono text-xs">
                      {file.lines.map((line, idx) => {
                        const pinned =
                          line.newLine !== null
                            ? visibleComments.filter(
                                (c) =>
                                  c.path === file.path &&
                                  c.end_line === line.newLine,
                              )
                            : []
                        return (
                          <div key={`${file.path}-${idx}`}>
                            <div className="flex gap-2 px-2 py-0.5">
                              <span className="w-8 shrink-0 text-right text-muted-foreground">
                                {line.newLine ?? ""}
                              </span>
                              <span
                                className={
                                  line.prefix === "+"
                                    ? "text-green-700 dark:text-green-400"
                                    : line.prefix === "-"
                                      ? "text-red-700 dark:text-red-400"
                                      : ""
                                }
                              >
                                {line.prefix}
                                {line.text}
                              </span>
                            </div>
                            {pinned.map((comment) => (
                              <div
                                key={`${comment.path}-${comment.start_line}-${comment.content.slice(0, 20)}`}
                                className="border-l-4 border-primary bg-card px-3 py-2 text-xs"
                              >
                                <div className="mb-1 flex flex-wrap gap-2">
                                  <Badge variant="outline">
                                    {comment.severity ?? "unrated"}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {comment.category ?? "other"}
                                  </Badge>
                                </div>
                                <p>{comment.content}</p>
                                {comment.suggestion_code && (
                                  <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-[11px]">
                                    {comment.suggestion_code}
                                  </pre>
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {analyze && (
            <Card>
              <CardHeader>
                <CardTitle>Rules OCR matched</CardTitle>
                <CardDescription>
                  From <code className="text-xs">ocr delegate rule</code> — these
                  are checklists for the LLM, not static analyzers that detect
                  bugs.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {analyze.ruleGroups.map((group) => (
                  <Collapsible key={group.group_id} defaultOpen>
                    <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-medium">
                      <span>
                        <code className="text-xs">{group.pattern}</code>
                        <span className="ml-2 text-muted-foreground">
                          {group.files.join(", ")}
                        </span>
                      </span>
                      <ChevronDownIcon className="size-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="flex flex-col gap-2 px-1 pt-2">
                      {group.sections.map((section) => (
                        <div key={section.title} className="rounded-md border p-3">
                          <div className="text-sm font-medium">{section.title}</div>
                          <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                            {section.checklist.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
                <Separator />
                <p className="text-xs text-muted-foreground">
                  Comment categories link to related sections when obvious (e.g.{" "}
                  {categorySectionHint("security")} for security findings).
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
