import { useCallback, useEffect, useMemo, useState } from "react"
import { diffLines } from "diff"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { buildCommandPreview, buildFmtFlags } from "@lib/flags.ts"
import { SAMPLES, type EditorLanguage } from "@/lib/samples"

type StatusResponse = {
  bunVersion: string
  supportsFmt: boolean
  fmtVersion: string | null
  smokeOk: boolean
}

type FormatResponse = {
  formatted?: string
  changed?: boolean
  elapsedMs?: number
  fmtReportedMs?: number
  stderr?: string
  error?: string
}

const MAX_BYTES = 100 * 1024

export default function App() {
  const [language, setLanguage] = useState<EditorLanguage>("js")
  const [sampleId, setSampleId] = useState(SAMPLES.js[0]!.id)
  const [code, setCode] = useState(SAMPLES.js[0]!.code)
  const [semicolons, setSemicolons] = useState(true)
  const [singleQuote, setSingleQuote] = useState(false)
  const [printWidth, setPrintWidth] = useState(80)

  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<FormatResponse | null>(null)
  const [formatted, setFormatted] = useState<string | null>(null)

  const options = useMemo(
    () => ({
      semi: semicolons,
      singleQuote,
      printWidth,
    }),
    [semicolons, singleQuote, printWidth],
  )

  const flagPreview = useMemo(() => {
    const built = buildFmtFlags(options)
    const ext = language === "js" ? "js" : language
    return buildCommandPreview(built.ok ? built.flags : [], ext)
  }, [language, options])

  const byteSize = useMemo(() => new TextEncoder().encode(code).byteLength, [code])

  const diffText = useMemo(() => {
    if (!formatted) return ""
    return diffLines(code, formatted)
      .map((part) => {
        const prefix = part.added ? "+ " : part.removed ? "- " : "  "
        return part.value
          .split("\n")
          .filter((line, i, arr) => i < arr.length - 1 || line.length > 0)
          .map((line) => prefix + line)
          .join("\n")
      })
      .join("")
  }, [code, formatted])

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((data: StatusResponse) => setStatus(data))
      .catch(() => setStatus(null))
  }, [])

  const onLanguageChange = (value: EditorLanguage) => {
    setLanguage(value)
    const first = SAMPLES[value][0]!
    setSampleId(first.id)
    setCode(first.code)
    setResult(null)
    setFormatted(null)
    setError(null)
  }

  const onSampleChange = (id: string) => {
    setSampleId(id)
    const sample = SAMPLES[language].find((s) => s.id === id)
    if (sample) {
      setCode(sample.code)
      setResult(null)
      setFormatted(null)
      setError(null)
    }
  }

  const runFormat = useCallback(async () => {
    if (byteSize > MAX_BYTES) {
      setError("Code exceeds the 100 KB limit.")
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    setFormatted(null)
    try {
      const res = await fetch("/api/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, options }),
      })
      const data = (await res.json()) as FormatResponse
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`)
        return
      }
      setResult(data)
      setFormatted(data.formatted ?? null)
    } catch {
      setError("Could not reach the format API. Is the dev server running?")
    } finally {
      setLoading(false)
    }
  }, [byteSize, code, language, options])

  const copyFormatted = async () => {
    if (!formatted) return
    await navigator.clipboard.writeText(formatted)
  }

  const needsUpgrade = status !== null && !status.supportsFmt

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Bun fmt Playground</h1>
          <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
            Paste or pick a snippet, tune Prettier-compatible flags, and run the real{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">bun fmt</code> from Bun
            v1.4.4 locally. From the release notes: formatting Prettier&apos;s own repo took
            about 59.7&nbsp;ms with Bun vs 17.1&nbsp;s with Prettier (quote as release-note
            benchmarks, not live comparisons here).
          </p>
        </header>

        {needsUpgrade && (
          <Alert variant="destructive">
            <AlertTitle>Bun {status?.bunVersion} — upgrade required</AlertTitle>
            <AlertDescription>
              This playground needs Bun &gt;= 1.4.4 for{" "}
              <code className="text-xs">bun fmt</code>. Install with{" "}
              <code className="text-xs">
                curl -fsSL https://bun.sh/install | bash -s &quot;bun-v1.4.4&quot;
              </code>
              .
            </AlertDescription>
          </Alert>
        )}

        {status && !needsUpgrade && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary">Bun {status.bunVersion}</Badge>
            {status.fmtVersion && <Badge variant="outline">fmt {status.fmtVersion}</Badge>}
            {status.smokeOk && <Badge variant="outline">stdin smoke ok</Badge>}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Editor</CardTitle>
              <CardDescription>
                Language, samples, and your code (max 100 KB — {byteSize.toLocaleString()}{" "}
                bytes).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={(v) => onLanguageChange(v as EditorLanguage)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="js">JavaScript</SelectItem>
                      <SelectItem value="ts">TypeScript</SelectItem>
                      <SelectItem value="css">CSS</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sample</Label>
                  <Select value={sampleId} onValueChange={onSampleChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SAMPLES[language].map((sample) => (
                        <SelectItem key={sample.id} value={sample.id}>
                          {sample.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Textarea
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setResult(null)
                  setFormatted(null)
                  setError(null)
                }}
                className="min-h-[220px] font-mono text-sm"
                spellCheck={false}
              />

              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="semi">Semicolons</Label>
                    <p className="text-muted-foreground text-xs">Off adds --no-semi</p>
                  </div>
                  <Switch
                    id="semi"
                    checked={semicolons}
                    onCheckedChange={setSemicolons}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="quotes">Single quotes</Label>
                    <p className="text-muted-foreground text-xs">Adds --single-quote</p>
                  </div>
                  <Switch
                    id="quotes"
                    checked={singleQuote}
                    onCheckedChange={setSingleQuote}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Print width</Label>
                    <span className="text-muted-foreground text-xs">{printWidth}</span>
                  </div>
                  <Slider
                    min={40}
                    max={160}
                    step={1}
                    value={[printWidth]}
                    onValueChange={(v) => setPrintWidth(v[0] ?? 80)}
                  />
                </div>
                <p className="text-muted-foreground font-mono text-xs break-all">{flagPreview}</p>
              </div>

              <Button
                className="w-full"
                onClick={runFormat}
                disabled={loading || needsUpgrade || byteSize > MAX_BYTES}
              >
                {loading ? "Formatting…" : "Format with bun fmt"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Result</CardTitle>
              <CardDescription>Diff, timing, and formatted output.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Formatter error</AlertTitle>
                  <AlertDescription className="whitespace-pre-wrap font-mono text-xs">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {result && !error && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={result.changed ? "default" : "secondary"}>
                    {result.changed ? "Changed" : "Already formatted"}
                  </Badge>
                  {typeof result.elapsedMs === "number" && (
                    <Badge variant="outline">{result.elapsedMs.toFixed(2)} ms elapsed</Badge>
                  )}
                  {typeof result.fmtReportedMs === "number" && (
                    <Badge variant="outline">
                      bun reported {result.fmtReportedMs.toFixed(2)} ms
                    </Badge>
                  )}
                </div>
              )}

              {formatted && (
                <>
                  <pre className="bg-muted max-h-[320px] overflow-auto rounded-md p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                    {diffText || "(no diff lines)"}
                  </pre>
                  <Button variant="secondary" onClick={copyFormatted}>
                    Copy formatted
                  </Button>
                </>
              )}

              {!formatted && !error && (
                <p className="text-muted-foreground text-sm">
                  Run Format to see a unified diff and timing from the real CLI.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
