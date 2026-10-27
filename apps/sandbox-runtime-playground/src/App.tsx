import { useCallback, useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  buildSrtSettings,
  defaultPolicyToggles,
  settingsToCliExample,
} from "../lib/settings.ts"
import { PRESETS } from "../lib/presets.ts"
import type { PolicyToggles, PresetId, RunResult } from "../lib/types.ts"

type ApiStatus = {
  usable: boolean
  platform: string
  missing: string[]
  message: string
}

const folderLabels: Record<keyof PolicyToggles["folders"], string> = {
  project: "Project dir (.)",
  tmp: "/tmp",
  ssh: "~/.ssh",
  documents: "~/Documents",
}

export default function App() {
  const [toggles, setToggles] = useState<PolicyToggles>(defaultPolicyToggles)
  const [domainInput, setDomainInput] = useState("")
  const [denyDomainInput, setDenyDomainInput] = useState("")
  const [status, setStatus] = useState<ApiStatus | null>(null)
  const [useReal, setUseReal] = useState(false)
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState<RunResult[]>([])

  const settings = useMemo(() => buildSrtSettings(toggles), [toggles])
  const settingsJson = useMemo(() => JSON.stringify(settings, null, 2), [settings])
  const cliLine = useMemo(
    () => settingsToCliExample(settings, "curl https://github.com"),
    [settings],
  )

  const refreshStatus = useCallback(async () => {
    const res = await fetch("/api/status")
    const data = (await res.json()) as ApiStatus
    setStatus(data)
    if (!data.usable) setUseReal(false)
  }, [])

  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  const effectiveReal = useReal && (status?.usable ?? false)

  const runPreset = async (presetId: PresetId) => {
    setRunning(true)
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presetId,
          settings,
          useReal: effectiveReal,
        }),
      })
      const result = (await res.json()) as RunResult
      setLog((prev) => [result, ...prev])
    } finally {
      setRunning(false)
    }
  }

  const runAll = async () => {
    setRunning(true)
    try {
      for (const preset of PRESETS) {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presetId: preset.id,
            settings,
            useReal: effectiveReal,
          }),
        })
        const result = (await res.json()) as RunResult
        setLog((prev) => [result, ...prev])
      }
    } finally {
      setRunning(false)
    }
  }

  const copySettings = async () => {
    await navigator.clipboard.writeText(settingsJson)
  }

  const addAllowedDomain = () => {
    const d = domainInput.trim()
    if (!d || toggles.allowedDomains.includes(d)) return
    setToggles((t) => ({ ...t, allowedDomains: [...t.allowedDomains, d] }))
    setDomainInput("")
  }

  const addDeniedDomain = () => {
    const d = denyDomainInput.trim()
    if (!d || toggles.deniedDomains.includes(d)) return
    setToggles((t) => ({ ...t, deniedDomains: [...t.deniedDomains, d] }))
    setDenyDomainInput("")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <h1 className="text-2xl font-semibold tracking-tight">Sandbox Runtime Playground</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure Anthropic <code className="text-xs">srt</code> filesystem and network policy,
          then run preset agent commands.
        </p>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 p-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mode</CardTitle>
              <CardDescription>
                Mock (simulated) mode is always available. Real mode uses OS sandboxing when
                dependencies are present.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="real-mode">Use real sandbox-runtime</Label>
                  <p className="text-muted-foreground text-xs mt-1">
                    {status?.message ?? "Checking status…"}
                  </p>
                </div>
                <Switch
                  id="real-mode"
                  checked={effectiveReal}
                  disabled={!status?.usable || running}
                  onCheckedChange={(v) => setUseReal(v)}
                />
              </div>
              {status && !status.usable && status.missing.length > 0 && (
                <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                  {status.missing.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              )}
              <Badge variant={effectiveReal ? "default" : "secondary"}>
                {effectiveReal ? "real" : "simulated"}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policy</CardTitle>
              <CardDescription>Folder and domain rules for the live settings JSON.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {(Object.keys(folderLabels) as (keyof PolicyToggles["folders"])[]).map((key) => {
                  const f = toggles.folders[key]
                  return (
                    <div key={key} className="rounded-lg border p-3 space-y-3">
                      <p className="font-medium text-sm">{folderLabels[key]}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor={`${key}-read`}>Allow read</Label>
                          <Switch
                            id={`${key}-read`}
                            checked={f.read}
                            disabled={f.denyRead}
                            onCheckedChange={(v) =>
                              setToggles((t) => ({
                                ...t,
                                folders: {
                                  ...t.folders,
                                  [key]: { ...t.folders[key], read: v },
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor={`${key}-write`}>Allow write</Label>
                          <Switch
                            id={`${key}-write`}
                            checked={f.write}
                            onCheckedChange={(v) =>
                              setToggles((t) => ({
                                ...t,
                                folders: {
                                  ...t.folders,
                                  [key]: { ...t.folders[key], write: v },
                                },
                              }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <Label htmlFor={`${key}-deny`}>Deny read</Label>
                          <Switch
                            id={`${key}-deny`}
                            checked={f.denyRead}
                            onCheckedChange={(v) =>
                              setToggles((t) => ({
                                ...t,
                                folders: {
                                  ...t.folders,
                                  [key]: {
                                    ...t.folders[key],
                                    denyRead: v,
                                    read: v ? false : t.folders[key].read,
                                  },
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator />

              <Tabs defaultValue="allowed">
                <TabsList>
                  <TabsTrigger value="allowed">Allowed domains</TabsTrigger>
                  <TabsTrigger value="denied">Denied domains</TabsTrigger>
                </TabsList>
                <TabsContent value="allowed" className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="github.com"
                      value={domainInput}
                      onChange={(e) => setDomainInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addAllowedDomain()}
                    />
                    <Button type="button" variant="secondary" onClick={addAllowedDomain}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {toggles.allowedDomains.map((d) => (
                      <Badge key={d} variant="outline" className="gap-1">
                        {d}
                        <button
                          type="button"
                          className="ml-1 opacity-60 hover:opacity-100"
                          onClick={() =>
                            setToggles((t) => ({
                              ...t,
                              allowedDomains: t.allowedDomains.filter((x) => x !== d),
                            }))
                          }
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="denied" className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="example.com"
                      value={denyDomainInput}
                      onChange={(e) => setDenyDomainInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addDeniedDomain()}
                    />
                    <Button type="button" variant="secondary" onClick={addDeniedDomain}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {toggles.deniedDomains.map((d) => (
                      <Badge key={d} variant="outline" className="gap-1">
                        {d}
                        <button
                          type="button"
                          className="ml-1 opacity-60 hover:opacity-100"
                          onClick={() =>
                            setToggles((t) => ({
                              ...t,
                              deniedDomains: t.deniedDomains.filter((x) => x !== d),
                            }))
                          }
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Live srt-settings.json</CardTitle>
                <CardDescription>Updates as you change policy toggles.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={copySettings}>
                Copy JSON
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <ScrollArea className="h-56 rounded-md border bg-muted/40 p-3">
                <pre className="text-xs font-mono whitespace-pre-wrap">{settingsJson}</pre>
              </ScrollArea>
              <p className="text-xs font-mono text-muted-foreground break-all">{cliLine}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preset commands</CardTitle>
              <CardDescription>Fixed commands only — no free-form shell from the browser.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <Button
                    key={p.id}
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={running}
                    onClick={() => runPreset(p.id)}
                  >
                    {p.label}
                  </Button>
                ))}
                <Button type="button" disabled={running} onClick={runAll}>
                  Run all
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Run log</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80 pr-3">
                {log.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Run a preset to see results.</p>
                ) : (
                  <ul className="space-y-3">
                    {log.map((entry, i) => (
                      <li key={`${entry.presetId}-${i}-${entry.durationMs}`} className="border rounded-lg p-3 text-sm space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={entry.allowed ? "default" : "destructive"}>
                            {entry.allowed ? "ALLOWED" : "BLOCKED"}
                          </Badge>
                          <Badge variant="outline">{entry.mode}</Badge>
                          <span className="text-muted-foreground text-xs">{entry.durationMs}ms</span>
                        </div>
                        <p className="font-mono text-xs break-all">{entry.command}</p>
                        <p className="text-xs">{entry.reason}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
