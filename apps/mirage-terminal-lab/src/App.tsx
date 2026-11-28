import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MirageLab,
  presetsForProfile,
  stepCommandHistory,
  type CommandLogEntry,
  type MountTreeNode,
  type ProfileId,
  type RunOutput,
} from "@/lib/lab-client"

function MountTree({ nodes }: { nodes: MountTreeNode[] }) {
  return (
    <ul className="space-y-1 text-xs font-mono">
      {nodes.map((node) => (
        <li key={node.path}>
          <div className="flex flex-wrap items-center gap-2" data-path={node.path}>
            <span className="text-foreground">{node.path}</span>
            <Badge variant="outline">{node.mode}</Badge>
            <span className="text-muted-foreground">{node.kind}</span>
          </div>
          {node.children && node.children.length > 0 && (
            <div className="mt-1 ml-3 border-l pl-2">
              <MountTree nodes={node.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

function TerminalOutput({ run }: { run: RunOutput | null }) {
  if (!run) {
    return <p className="text-muted-foreground text-sm">Run a command to see stdout/stderr.</p>
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant={run.allowed ? "default" : "destructive"}>
          {run.allowed ? "allowed" : "denied"} · exit {run.exitCode}
        </Badge>
        <Badge variant="outline">{run.durationMs}ms</Badge>
      </div>
      <pre
        className="max-h-56 overflow-auto rounded-md border bg-zinc-950 p-3 text-xs text-zinc-100"
        aria-live="polite"
      >
        {run.stdout}
        {run.stderr ? `\n[stderr]\n${run.stderr}` : ""}
      </pre>
    </div>
  )
}

function LogTable({ rows }: { rows: CommandLogEntry[] }) {
  return (
    <ScrollArea className="h-64 rounded-md border">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 sticky top-0">
          <tr className="text-left">
            <th className="p-2">Profile</th>
            <th className="p-2">Cmd</th>
            <th className="p-2">Exit</th>
            <th className="p-2">ms</th>
            <th className="p-2">Summary</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="text-muted-foreground p-3">
                No commands logged yet.
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr key={row.id} className="border-t align-top">
              <td className="p-2 font-medium">{row.profile}</td>
              <td className="p-2 font-mono">{row.command}</td>
              <td className="p-2">{row.exitCode}</td>
              <td className="p-2">{row.durationMs}</td>
              <td className="p-2 text-muted-foreground">
                {row.allowed ? row.stdoutSummary || "(ok)" : row.stderrSummary || "denied"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  )
}

export default function App() {
  const labRef = useRef<MirageLab | null>(null)
  const [ready, setReady] = useState(false)
  const [profile, setProfile] = useState<ProfileId>("analyst")
  const [input, setInput] = useState('grep -rl invoice /docs /s3 /data')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [lastRun, setLastRun] = useState<RunOutput | null>(null)
  const [logs, setLogs] = useState<CommandLogEntry[]>([])
  const [mounts, setMounts] = useState<MountTreeNode[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshTree = useCallback(async () => {
    if (!labRef.current) return
    const tree = await labRef.current.listMountTree()
    setMounts(tree)
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const lab = new MirageLab()
        await lab.init()
        if (cancelled) {
          await lab.workspace.close()
          return
        }
        labRef.current = lab
        lab.setProfile("analyst")
        await refreshTree()
        setReady(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    })()
    return () => {
      cancelled = true
      void labRef.current?.workspace.close()
    }
  }, [refreshTree])

  const runCommand = useCallback(
    async (command: string, profileId?: ProfileId) => {
      if (!labRef.current) return
      setBusy(true)
      setError(null)
      try {
        const id = profileId ?? profile
        labRef.current.setProfile(id)
        const out = await labRef.current.run(command, id)
        setLastRun(out)
        setLogs([...labRef.current.commandLog])
        setHistory((h) => (h[h.length - 1] === command ? h : [...h, command]))
        setHistoryIdx(-1)
        await refreshTree()
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setBusy(false)
      }
    },
    [profile, refreshTree],
  )

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = input.trim()
      if (!trimmed || busy) return
      void runCommand(trimmed)
    },
    [busy, input, runCommand],
  )

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        const stepped = stepCommandHistory(history, historyIdx, e.key)
        if (stepped === null) return
        e.preventDefault()
        setHistoryIdx(stepped.historyIdx)
        setInput(stepped.input)
      }
    },
    [history, historyIdx],
  )

  const profilePresets = useMemo(() => presetsForProfile(profile), [profile])

  const exportTrace = useCallback(() => {
    if (!labRef.current) return
    const blob = new Blob([labRef.current.exportTraceJson()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "mirage-trace.json"
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  if (error && !ready) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <p className="text-destructive">Failed to start Mirage: {error}</p>
      </main>
    )
  }

  return (
    <main className="bg-background text-foreground min-h-dvh overflow-x-clip">
      <header className="border-b px-4 py-4 sm:px-6">
        <h1 className="text-xl font-semibold tracking-tight">Mirage Terminal Lab</h1>
        <p className="text-muted-foreground text-sm">
          Offline RAM-backed Mirage shell · profiles · mount tree · command log
        </p>
      </header>

      <div className="mx-auto grid min-w-0 max-w-6xl gap-4 p-4 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:p-6">
        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Session profile</CardTitle>
              <CardDescription>Same command, different policy.</CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="profile" className="sr-only">
                Profile
              </Label>
              <Select
                value={profile}
                onValueChange={(v) => {
                  const id = v as ProfileId
                  setProfile(id)
                  labRef.current?.setProfile(id)
                }}
              >
                <SelectTrigger id="profile" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="analyst">analyst</SelectItem>
                  <SelectItem value="intern">intern</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Mounts</CardTitle>
              <CardDescription>Modes and paths after writes.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 pr-2">
                {ready ? <MountTree nodes={mounts} /> : <p className="text-muted-foreground text-xs">Loading…</p>}
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Terminal</CardTitle>
              <CardDescription>
                History: ↑ / ↓ · read-only <code className="text-xs">/s3</code> · writable{" "}
                <code className="text-xs">/scratch</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
                <label className="sr-only" htmlFor="command">
                  Shell command
                </label>
                <input
                  id="command"
                  className="border-input bg-background focus-visible:ring-ring flex-1 rounded-md border px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={!ready || busy}
                  autoComplete="off"
                  spellCheck={false}
                />
                <Button type="submit" disabled={!ready || busy}>
                  Run
                </Button>
              </form>
              <div className="flex max-w-full flex-wrap gap-2">
                {profilePresets.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-auto max-w-full py-2 text-left whitespace-normal"
                    disabled={busy}
                    onClick={() => {
                      setInput(preset.command)
                      void runCommand(preset.command, preset.profile ?? profile)
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <TerminalOutput run={lastRun} />
            </CardContent>
          </Card>

          <Tabs defaultValue="log">
            <TabsList>
              <TabsTrigger value="log">Command log</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            <TabsContent value="log" className="space-y-2">
              <div className="flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={exportTrace} disabled={!ready}>
                  Export trace JSON
                </Button>
              </div>
              <LogTable rows={logs} />
            </TabsContent>
            <TabsContent value="about">
              <Card>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-3 pt-6">
                  <p>
                    Independent demo of{" "}
                    <a href="https://github.com/strukto-ai/mirage" className="underline">
                      Strukto Mirage
                    </a>{" "}
                    (<code>@struktoai/mirage-browser@0.1.0</code>) in the browser. Not an official Strukto
                    product.
                  </p>
                  <p>
                    Docs:{" "}
                    <a href="https://docs.mirage.strukto.ai/typescript/quickstart" className="underline">
                      TypeScript quickstart
                    </a>
                    · Launch:{" "}
                    <a href="https://x.com/zechengzh/status/2125308941190250618" className="underline">
                      @zechengzh
                    </a>
                  </p>
                  <p>
                    <strong>Machines:</strong> skipped — 0.1.0 browser build has no in-process machine demo without
                    optional peers (e2b, pyodide, monty). Shell + RAM mounts only.
                  </p>
                  <p className="text-muted-foreground text-xs">Apache-2.0 · see THIRD_PARTY_LICENSES.md</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
      <Separator className="mt-6" />
    </main>
  )
}