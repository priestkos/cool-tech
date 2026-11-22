import { useCallback, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  LAB_BIOMES,
  compileWorldFrame,
  hasWebGL,
  type CompileResult,
  type SceneId,
} from "@/lib/compile-world"
import { buildScaleTable } from "@/lib/scale-authority"
import { Loader2, RefreshCw, Sparkles } from "lucide-react"

const FROSTWIND_PIN = "537ed51d215096df54ab45770f4f811481a2986b"

export function FrostwindLab() {
  const scaleRows = useMemo(() => buildScaleTable(), [])
  const [sceneId, setSceneId] = useState<SceneId>("frostwood")
  const [seed, setSeed] = useState("20260727")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [last, setLast] = useState<CompileResult | null>(null)
  const [prevFingerprint, setPrevFingerprint] = useState<string | null>(null)
  const [matchNote, setMatchNote] = useState<string | null>(null)

  const runCompile = useCallback(
    (comparePrevious: boolean) => {
      if (!hasWebGL()) {
        setError("WebGL is required to run the Frostwind compiler in this browser.")
        return
      }
      setBusy(true)
      setError(null)
      setMatchNote(null)
      requestAnimationFrame(() => {
        try {
          const parsed = Number.parseInt(seed, 10)
          if (!Number.isFinite(parsed) || parsed < 0) throw new Error("Seed must be a non-negative integer.")
          const canvas = document.getElementById("fw-compile-canvas") as HTMLCanvasElement | null
          const result = compileWorldFrame(sceneId, parsed, canvas ?? undefined)
          if (comparePrevious && prevFingerprint) {
            setMatchNote(
              result.fingerprint === prevFingerprint
                ? "Same-seed re-render: fingerprints match (pixel-identical)."
                : "Fingerprints differ — unexpected for same seed.",
            )
          }
          setPrevFingerprint(result.fingerprint)
          setLast(result)
        } catch (e) {
          setError(e instanceof Error ? e.message : String(e))
        } finally {
          setBusy(false)
        }
      })
    },
    [prevFingerprint, sceneId, seed],
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Frostwind World Lab</h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
              Real Trinity Frostwind compiler (MIT), pinned at{" "}
              <code className="text-xs">{FROSTWIND_PIN.slice(0, 12)}…</code>. Offline — no API keys,
              no runtime network. Amethyst Hollow and Pond Court exist in canon but are not required here.
            </p>
          </div>
          <Badge variant="secondary">Independent demo · not official</Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compiled frame</CardTitle>
              <CardDescription>
                Biome picker runs <code>FrostwoodWorld.build</code> + GPU composite at 480×270, pinned t=
                12.5s (capture contract).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Biome">
                {LAB_BIOMES.map((b) => (
                  <Button
                    key={b.id}
                    type="button"
                    variant={sceneId === b.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSceneId(b.id)}
                    aria-pressed={sceneId === b.id}
                  >
                    {b.label}
                  </Button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                <div className="space-y-1">
                  <Label htmlFor="seed">World seed</Label>
                  <input
                    id="seed"
                    className="border-input bg-background ring-offset-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                    inputMode="numeric"
                    value={seed}
                    onChange={(e) => setSeed(e.target.value)}
                  />
                </div>
                <Button type="button" disabled={busy} onClick={() => runCompile(false)}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  Compile
                </Button>
                <Button type="button" variant="secondary" disabled={busy} onClick={() => runCompile(true)}>
                  <RefreshCw className="size-4" />
                  Re-render same seed
                </Button>
              </div>

              {error && (
                <p className="text-destructive text-sm" role="alert">
                  {error}
                </p>
              )}
              {matchNote && <p className="text-sm text-success">{matchNote}</p>}
              {last && (
                <dl className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                  <GraphItem label="Scene" value={last.sceneId} />
                  <GraphItem label="Seed" value={String(last.seed)} />
                  <GraphItem label="Fingerprint" value={last.fingerprint} />
                  <GraphItem label="Compile ms" value={last.elapsedMs.toFixed(0)} />
                </dl>
              )}

              <div className="relative overflow-hidden rounded-lg border border-border bg-[#0b0f16] p-2">
                <canvas id="fw-compile-canvas" className="sr-only" aria-hidden tabIndex={-1} width={480} height={270} />
                {last?.dataUrl ? (
                  <img
                    src={last.dataUrl}
                    alt={`Compiler frame for ${last.sceneId} seed ${last.seed}`}
                    className="mx-auto block max-w-full image-rendering-pixelated"
                    width={last.width}
                    height={last.height}
                  />
                ) : (
                  <p className="text-muted-foreground py-16 text-center text-sm">Compile a biome to see the frame.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scale authority</CardTitle>
              <CardDescription>From real <code>src/scale.js</code> and <code>measureDeer()</code>.</CardDescription>
            </CardHeader>
            <CardContent>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b">
                    <th className="pb-2 pr-2 font-medium">Subject</th>
                    <th className="pb-2 pr-2 font-medium">m</th>
                    <th className="pb-2 font-medium">px</th>
                  </tr>
                </thead>
                <tbody>
                  {scaleRows.map((row) => (
                    <tr key={row.id} className="border-b border-border/60 align-top">
                      <td className="py-2 pr-2">
                        <span className="font-medium">{row.label}</span>
                        <p className="text-muted-foreground mt-1 font-mono text-[10px] leading-snug">{row.formula}</p>
                      </td>
                      <td className="py-2 pr-2 tabular-nums">{formatMetres(row.metres)}</td>
                      <td className="py-2 tabular-nums">{row.pixels}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About / credits</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-xs leading-relaxed">
              <p>
                Copyright (c) 2026 Trinity Labs Pte. Ltd. — MIT License. Frostwind sources vendored at commit{" "}
                <a
                  className="text-foreground underline"
                  href="https://github.com/trinity-works/frostwind/tree/537ed51d215096df54ab45770f4f811481a2986b"
                  rel="noreferrer"
                >
                  {FROSTWIND_PIN.slice(0, 7)}
                </a>
                .
              </p>
              <p>
                Playground:{" "}
                <a className="text-foreground underline" href="https://project-frostwind.fly.dev/" rel="noreferrer">
                  project-frostwind.fly.dev
                </a>
              </p>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  )
}

function GraphItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide">{label}</dt>
      <dd className="text-foreground font-mono text-[11px] break-all">{value}</dd>
    </div>
  )
}

function formatMetres(m: number): string {
  return m < 2 ? m.toFixed(2) : m.toFixed(3)
}