import { useCallback, useMemo, useState } from "react"
import { PRESETS } from "@/data/presets.ts"
import type { PresetId, RunResultPayload, ToolCallLogEntry } from "@/types.ts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  corruptProbe,
  forkSnapshot,
  resumeChild,
  resumeSnapshot,
  runCode,
  runEscapePanel,
  runPreset,
  startPauseSession,
  suspendBlockedDemo,
  suspendSession,
} from "@/lib/api"

function downloadSnapshot(bytesBase64: string) {
  const bytes = Uint8Array.from(atob(bytesBase64), (c) => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "run.psnap"
  a.click()
  URL.revokeObjectURL(url)
}

function ResultView({ result }: { result: RunResultPayload | null }) {
  if (!result) return <p className="text-muted-foreground text-sm">No run yet.</p>
  return (
    <div className="space-y-2 text-sm">
      <TokenBadge ok={result.ok} label={result.ok ? "ok" : "error"} />
      <p className="text-muted-foreground">
        {result.processLabel} · pid {result.pid}
      </p>
      <pre className="max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
        {JSON.stringify(
          result.ok
            ? { ok: true, value: result.value, logs: result.logs, warnings: result.warnings }
            : { ok: false, error: result.error, logs: result.logs },
          null,
          2,
        )}
      </pre>
    </div>
  )
}

function TokenBadge({ ok, label }: { ok: boolean; label: string }) {
  return <Badge variant={ok ? "default" : "destructive"}>{label}</Badge>
}

function ToolLog({ calls }: { calls: ToolCallLogEntry[] }) {
  return (
    <ScrollArea className="h-56 rounded-md border">
      <ul className="divide-y p-2 text-xs">
        {calls.length === 0 && <li className="text-muted-foreground p-2">No host calls yet.</li>}
        {calls.map((c) => (
          <li key={`${c.key}-${c.startedAt}`} className="space-y-1 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground">{c.durationMs}ms</span>
              <span className="text-muted-foreground truncate">key {c.key}</span>
            </div>
            <div className="text-muted-foreground">args {JSON.stringify(c.args)}</div>
            {c.error ? (
              <div className="text-destructive">{c.error.kind}: {c.error.message}</div>
            ) : (
              <div className="truncate">→ {JSON.stringify(c.result)}</div>
            )}
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}

export default function App() {
  const [presetId, setPresetId] = useState<PresetId>("chain")
  const [code, setCode] = useState(PRESETS[0].code)
  const [busy, setBusy] = useState(false)
  const [lastResult, setLastResult] = useState<RunResultPayload | null>(null)
  const [toolCalls, setToolCalls] = useState<ToolCallLogEntry[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<{ byteLength: number; bytesBase64: string } | null>(null)
  const [resumeResult, setResumeResult] = useState<RunResultPayload | null>(null)
  const [childResult, setChildResult] = useState<RunResultPayload | null>(null)
  const [forkPair, setForkPair] = useState<{ left: RunResultPayload; right: RunResultPayload } | null>(null)
  const [corruptMsg, setCorruptMsg] = useState<string | null>(null)
  const [suspendErr, setSuspendErr] = useState<string | null>(null)
  const [escapeRows, setEscapeRows] = useState<
    Array<{ id: string; label: string; ok: boolean; error?: string; value?: unknown }>
  >([])

  const activePreset = useMemo(() => PRESETS.find((p) => p.id === presetId) ?? PRESETS[0], [presetId])

  const applyPreset = (id: PresetId) => {
    setPresetId(id)
    const p = PRESETS.find((x) => x.id === id)
    if (p) setCode(p.code)
  }

  const run = useCallback(async () => {
    setBusy(true)
    try {
      const result = await runCode(code)
      setLastResult(result)
      setToolCalls(result.toolCalls)
    } finally {
      setBusy(false)
    }
  }, [code])

  const runSelectedPreset = useCallback(async () => {
    setBusy(true)
    try {
      const result = await runPreset(presetId)
      setLastResult(result)
      setToolCalls(result.toolCalls)
    } finally {
      setBusy(false)
    }
  }, [presetId])

  const beginPause = async () => {
    setBusy(true)
    setSessionId(null)
    try {
      applyPreset("long-pause")
      const started = await startPauseSession("long-pause")
      setSessionId(started.sessionId)
      await new Promise((r) => setTimeout(r, 120))
      const suspended = await suspendSession(started.sessionId)
      if (suspended.suspended) {
        setSnapshot({ byteLength: suspended.byteLength, bytesBase64: suspended.bytesBase64 })
      }
    } finally {
      setBusy(false)
    }
  }

  const onUpload = (file: File) => {
    file.arrayBuffer().then((buf) => {
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
      setSnapshot({ byteLength: buf.byteLength, bytesBase64: b64 })
    })
  }

  return (
    <div className="min-h-dvh">
      <header className="border-b bg-card/60 px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Psychoscript Lab</h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Confined, resumable JS via real <code className="text-xs">psychoscript@0.3.0</code> — mock host tools only,
              localhost API, no network escapes.
            </p>
          </div>
          <Badge variant="outline" className="w-fit">Independent demo · MIT upstream</Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 md:px-8 lg:grid-cols-2">
        <section className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Script editor</CardTitle>
              <CardDescription>Presets exercise chaining, loops, Host.fail, pause, and suspend errors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <Button
                    key={p.id}
                    type="button"
                    size="sm"
                    variant={p.id === presetId ? "default" : "outline"}
                    onClick={() => applyPreset(p.id)}
                    aria-pressed={p.id === presetId}
                  >
                    {p.title}
                  </Button>
                ))}
              </div>
              <Label htmlFor="code-editor" className="sr-only">
                Script source
              </Label>
              <textarea
                id="code-editor"
                className="border-input bg-background ring-offset-background focus-visible:ring-ring min-h-40 w-full rounded-md border px-3 py-2 font-mono text-sm focus-visible:ring-2 focus-visible:outline-none"
                value={code}
                spellCheck={false}
                onChange={(e) => setCode(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={busy} onClick={run}>
                  Run script
                </Button>
                <Button type="button" variant="secondary" disabled={busy} onClick={runSelectedPreset}>
                  Run preset: {activePreset.title}
                </Button>
              </div>
              <ResultView result={lastResult} />
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Live tool-call log</CardTitle>
            <CardDescription>Host calls with name, args, key, timing, and result.</CardDescription>
          </CardHeader>
          <CardContent>
            <ToolLog calls={toolCalls} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pause → snapshot</CardTitle>
            <CardDescription>
              Long-running preset waits on idempotent <code className="text-xs">weather.poll</code>; suspend serialises state.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button type="button" disabled={busy} onClick={beginPause}>
              Pause long-running preset
            </Button>
            {sessionId && (
              <p className="text-muted-foreground text-xs">
                Session {sessionId.slice(0, 8)}… in parent Bun server (pid {typeof window !== "undefined" ? "—" : ""})
              </p>
            )}
            {snapshot && (
              <div className="space-y-2 text-sm">
                <p>
                  Snapshot size: <strong>{snapshot.byteLength}</strong> bytes
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => downloadSnapshot(snapshot.bytesBase64)}>
                    Download .psnap
                  </Button>
                  <Label className="sr-only" htmlFor="upload-snap">
                    Upload snapshot
                  </Label>
                  <input
                    id="upload-snap"
                    type="file"
                    accept=".psnap,application/octet-stream"
                    className="text-xs"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) onUpload(f)
                    }}
                  />
                </div>
              </div>
            )}
            <Separator />
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                try {
                  const demo = await suspendBlockedDemo()
                  setSuspendErr(
                    demo.rejected
                      ? `${demo.name}: ${demo.message} (blocking: ${demo.running?.map((r) => r.path).join(", ")})`
                      : demo.message ?? "unexpected",
                  )
                } finally {
                  setBusy(false)
                }
              }}
            >
              Demo SuspendError (non-idempotent)
            </Button>
            {suspendErr && <p className="text-destructive text-xs">{suspendErr}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume &amp; fork</CardTitle>
            <CardDescription>
              Resume in this process or a spawned Bun child; fork applies sunny vs rainy weather profiles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!snapshot || busy}
                onClick={async () => {
                  if (!snapshot) return
                  setResumeResult(await resumeSnapshot(snapshot.bytesBase64))
                }}
              >
                Resume (parent)
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!snapshot || busy}
                onClick={async () => {
                  if (!snapshot) return
                  setChildResult(await resumeChild(snapshot.bytesBase64))
                }}
              >
                Resume (child process)
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!snapshot || busy}
                onClick={async () => {
                  if (!snapshot) return
                  setForkPair(await forkSnapshot(snapshot.bytesBase64))
                }}
              >
                Fork side-by-side
              </Button>
            </div>
            {resumeResult && (
              <div>
                <h3 className="mb-1 text-sm font-medium">Parent resume</h3>
                <ResultView result={resumeResult} />
              </div>
            )}
            {childResult && (
              <div>
                <h3 className="mb-1 text-sm font-medium">Child resume</h3>
                <ResultView result={childResult} />
              </div>
            )}
            {forkPair && (
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <h3 className="mb-1 text-sm font-medium">Fork A — sunny</h3>
                  <ResultView result={forkPair.left} />
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-medium">Fork B — rainy</h3>
                  <ResultView result={forkPair.right} />
                </div>
              </div>
            )}
            <Separator />
            <Button
              type="button"
              variant="destructive"
              disabled={!snapshot || busy}
              onClick={async () => {
                if (!snapshot) return
                const corrupt = await corruptProbe(snapshot.bytesBase64)
                setCorruptMsg(
                  corrupt.ok ? `${corrupt.name}: ${corrupt.message}` : corrupt.message ?? "no SnapshotError",
                )
              }}
            >
              Corrupt one byte → SnapshotError
            </Button>
            {corruptMsg && <p className="text-xs text-destructive">{corruptMsg}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sandbox escape probes</CardTitle>
            <CardDescription>One-click attempts; results are whatever the real VM returns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true)
                try {
                  const { probes } = await runEscapePanel()
                  setEscapeRows(probes)
                } finally {
                  setBusy(false)
                }
              }}
            >
              Run escape probes
            </Button>
            <ScrollArea className="h-52 rounded-md border">
              <ul className="divide-y p-2 text-xs">
                {escapeRows.map((row) => (
                  <li key={row.id} className="py-2">
                    <p className="font-medium">{row.label}</p>
                    {row.ok ? (
                      <p className="text-muted-foreground">ok → {JSON.stringify(row.value)}</p>
                    ) : (
                      <p className="text-destructive">{row.error}</p>
                    )}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About / credits</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm">
            <p>
              Lab built on{" "}
              <a className="text-primary underline" href="https://github.com/anomalyco/psychoscript" rel="noreferrer">
                psychoscript
              </a>{" "}
              (MIT) via npm pin <code className="text-xs">psychoscript@0.3.0</code>. Docs:{" "}
              <a className="text-primary underline" href="https://psychoscript.com" rel="noreferrer">
                psychoscript.com
              </a>
              . Launch:{" "}
              <a
                className="text-primary underline"
                href="https://x.com/opencode/status/2125702030832349374"
                rel="noreferrer"
              >
                OpenCode on X
              </a>
              .
            </p>
            <p>Not an official OpenCode / anomalyco product — independent cool-tech demo.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}