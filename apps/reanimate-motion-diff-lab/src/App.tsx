import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react"
import { toast } from "sonner"
import { DriftChart } from "@/components/drift-chart"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { NAMED_EASINGS, easingToCss } from "@/lib/bezier"
import { exportAnimationCss } from "@/lib/css-export"
import { deepCloneSpec } from "@/lib/keyframes"
import { computeCheckRows, specTableRows } from "@/lib/metrics"
import { applyNextPass, MAX_PASSES } from "@/lib/next-pass"
import { allRowsPass, computeOverallScore } from "@/lib/score"
import { SCORE_FORMULA, type AnimationSpec, type CubicBezier } from "@/lib/types"
import { sampleElementAnimation, waapiKeyframes } from "@/lib/waapi-sample"
import {
  REFERENCE_PRESETS,
  getPreset,
  totalAnimationMs,
} from "@/reference/presets"

function useThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"))
  const toggle = () => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle("dark", next)
      return next
    })
  }
  return { dark, toggle }
}

function AnimatedCard({
  label,
  spec,
  clockMs,
  live,
  innerRef,
}: {
  label: string
  spec: AnimationSpec
  clockMs: number
  live: boolean
  innerRef: RefObject<HTMLDivElement | null>
}) {
  const animRef = useRef<Animation | null>(null)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    animRef.current?.cancel()
    const anim = el.animate(waapiKeyframes(spec), {
      duration: spec.durationMs,
      delay: spec.delayMs,
      fill: "both",
      easing: easingToCss(spec.easing),
    })
    anim.pause()
    animRef.current = anim
    return () => anim.cancel()
  }, [spec, innerRef])

  useEffect(() => {
    const anim = animRef.current
    if (!anim || live) return
    anim.pause()
    anim.currentTime = clockMs
  }, [clockMs, live, spec])

  useEffect(() => {
    const anim = animRef.current
    if (!anim) return
    if (live) {
      anim.playbackRate = 1
      anim.play()
    } else {
      anim.pause()
      anim.currentTime = clockMs
    }
  }, [live, clockMs])

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/30 p-4">
        <div
          ref={innerRef}
          className="w-48 rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
        >
          <p className="text-sm font-medium">Demo card</p>
          <p className="text-xs text-muted-foreground">Bundled reference motion</p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { dark, toggle: toggleTheme } = useThemeToggle()
  const [presetId, setPresetId] = useState(REFERENCE_PRESETS[0].id)
  const preset = getPreset(presetId)
  const [copySpec, setCopySpec] = useState(() => deepCloneSpec(preset.initialCopy))
  const [fps, setFps] = useState<30 | 60>(60)
  const [clockMs, setClockMs] = useState(0)
  const [live, setLive] = useState(false)
  const [passCount, setPassCount] = useState(0)
  const [history, setHistory] = useState<
    { score: number; summary: string; spec: AnimationSpec }[]
  >([])
  const [undoStack, setUndoStack] = useState<AnimationSpec[]>([])

  const refEl = useRef<HTMLDivElement>(null)
  const copyEl = useRef<HTMLDivElement>(null)

  const totalMs = totalAnimationMs(preset.reference)

  useEffect(() => {
    setCopySpec(deepCloneSpec(preset.initialCopy))
    setPassCount(0)
    setHistory([])
    setUndoStack([])
    setClockMs(0)
    setLive(false)
  }, [presetId, preset.initialCopy])

  const resample = useCallback(() => {
    const refNode = refEl.current
    const copyNode = copyEl.current
    if (!refNode || !copyNode) return null
    const refTracks = sampleElementAnimation(refNode, preset.reference, fps, totalMs)
    const copyTracks = sampleElementAnimation(copyNode, copySpec, fps, totalMs)
    return { refTracks, copyTracks }
  }, [copySpec, fps, preset.reference, totalMs])

  const [tracks, setTracks] = useState<ReturnType<typeof resample>>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => setTracks(resample()))
    return () => cancelAnimationFrame(id)
  }, [resample])

  const rows = useMemo(() => {
    if (!tracks) return []
    return computeCheckRows(preset.reference, copySpec, tracks.refTracks, tracks.copyTracks)
  }, [tracks, preset.reference, copySpec])

  const score = computeOverallScore(rows)
  const residual = rows.filter((r) => !r.pass)

  const handleNextPass = () => {
    if (!tracks) return
    setUndoStack((s) => [...s, deepCloneSpec(copySpec)])
    const result = applyNextPass(
      copySpec,
      preset.reference,
      tracks.refTracks,
      tracks.copyTracks,
      passCount,
    )
    if (result.blocked) {
      toast.message(result.reason ?? "No more passes")
      return
    }
    setCopySpec(result.spec)
    setPassCount((c) => c + 1)
    setHistory((h) => [
      ...h,
      {
        score,
        summary: `Nudged ${result.row?.label ?? "row"}`,
        spec: deepCloneSpec(copySpec),
      },
    ])
  }

  const handleUndo = () => {
    setUndoStack((stack) => {
      const prev = stack.at(-1)
      if (!prev) return stack
      setCopySpec(prev)
      setPassCount((c) => Math.max(0, c - 1))
      return stack.slice(0, -1)
    })
  }

  const updateEasingPoints = (points: CubicBezier) => {
    setCopySpec((s) => ({ ...s, easing: { kind: "cubic-bezier", points } }))
  }

  const easingPoints: CubicBezier =
    copySpec.easing.kind === "linear"
      ? NAMED_EASINGS.linear
      : copySpec.easing.points

  const namedEasingValue =
    copySpec.easing.kind === "named" ? copySpec.easing.name : "custom"

  const setNamedEasing = (name: string) => {
    if (name === "custom") return
    const points = NAMED_EASINGS[name]
    if (!points) return
    setCopySpec((s) => ({ ...s, easing: { kind: "named", name, points } }))
  }

  const copyCss = () => {
    void navigator.clipboard.writeText(exportAnimationCss(copySpec))
    toast.success("CSS copied")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-card/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              Unofficial community demo. Not affiliated with Niaz Morshed or Reanimate. The real
              Reanimate is a Claude Code skill that records real pages and videos; it does not run
              in this page.
            </p>
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              Reanimate Motion Diff Lab
            </h1>
            <p className="text-xs text-muted-foreground">
              Inspired by{" "}
              <a
                className="underline underline-offset-2"
                href="https://github.com/NiazMorshed2007/reanimate"
                target="_blank"
                rel="noreferrer"
              >
                Reanimate
              </a>{" "}
              (MIT) ·{" "}
              <a
                className="underline underline-offset-2"
                href="https://x.com/niazmorshed_/status/2116006291852423247"
                target="_blank"
                rel="noreferrer"
              >
                source post
              </a>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={presetId} onValueChange={(v) => v && setPresetId(v)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Preset" />
              </SelectTrigger>
              <SelectContent>
                {REFERENCE_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              {dark ? "Light" : "Dark"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 py-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Stage · Record (bundled)</CardTitle>
              <CardDescription>
                Reference vs copy, sampled on a virtual clock ({fps} fps). Live play respects{" "}
                <code className="text-[0.65rem]">prefers-reduced-motion</code> via CSS; sampling
                stays seekable.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid gap-4 md:grid-cols-2 ${live ? "motion-live" : ""}`}>
                <AnimatedCard
                  label="Reference"
                  spec={preset.reference}
                  clockMs={clockMs}
                  live={live}
                  innerRef={refEl}
                />
                <AnimatedCard
                  label="Copy (editable)"
                  spec={copySpec}
                  clockMs={clockMs}
                  live={live}
                  innerRef={copyEl}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm" variant={live ? "default" : "outline"} onClick={() => setLive((v) => !v)}>
                  {live ? "Pause live" : "Play live"}
                </Button>
                <div className="flex min-w-[200px] flex-1 items-center gap-3">
                  <span className="text-xs text-muted-foreground">Scrub</span>
                  <Slider
                    value={[clockMs]}
                    min={0}
                    max={totalMs}
                    step={1000 / fps}
                    onValueChange={(v) => {
                      setLive(false)
                      const next = Array.isArray(v) ? v[0] : v
                      setClockMs(next ?? 0)
                    }}
                  />
                  <span className="w-14 text-right text-xs tabular-nums">{clockMs.toFixed(0)}ms</span>
                </div>
                <ToggleGroup
                  value={[String(fps)]}
                  onValueChange={(v) => {
                    const picked = v[0]
                    if (picked === "30" || picked === "60") setFps(picked === "30" ? 30 : 60)
                  }}
                >
                  <ToggleGroupItem value="30">30 fps</ToggleGroupItem>
                  <ToggleGroupItem value="60">60 fps</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Drift curves</CardTitle>
              <CardDescription>Reference, copy, and difference per property (SVG).</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {tracks &&
                (["translateY", "opacity", "scale"] as const).map((prop) => (
                  <DriftChart
                    key={prop}
                    property={prop}
                    refTrack={tracks.refTracks[prop]}
                    copyTrack={tracks.copyTracks[prop]}
                  />
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Spec table</CardTitle>
              <CardDescription>Motion rows for reference and copy (single element).</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="reference">
                <TabsList>
                  <TabsTrigger value="reference">Reference</TabsTrigger>
                  <TabsTrigger value="copy">Copy</TabsTrigger>
                </TabsList>
                <TabsContent value="reference">
                  <SpecTable spec={preset.reference} />
                </TabsContent>
                <TabsContent value="copy">
                  <SpecTable spec={copySpec} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Match score</CardTitle>
                <Badge variant={score >= 80 ? "default" : "destructive"}>{score}/100</Badge>
              </div>
              <CardDescription>
                Inspired by Reanimate&apos;s motion-faithful criteria (not an official Reanimate
                score). No pixel diffing in this MVP.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <pre className="overflow-x-auto rounded-md bg-muted/40 p-2 text-[0.65rem] leading-relaxed text-muted-foreground">
                {SCORE_FORMULA}
              </pre>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Check</TableHead>
                    <TableHead>Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs">{row.label}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant={row.pass ? "default" : "destructive"}>
                          {row.pass ? "pass" : "fail"}
                        </Badge>{" "}
                        {row.detail}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {residual.length > 0 && passCount >= MAX_PASSES && (
                <p className="text-xs text-destructive">
                  Residual after {MAX_PASSES} passes:{" "}
                  {residual.map((r) => `${r.label} (${r.detail})`).join("; ")}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleNextPass} disabled={allRowsPass(rows) || passCount >= MAX_PASSES}>
                  Next pass ({passCount}/{MAX_PASSES})
                </Button>
                <Button size="sm" variant="outline" onClick={handleUndo} disabled={undoStack.length === 0}>
                  Undo
                </Button>
              </div>
              <p className="text-[0.65rem] text-muted-foreground">
                Next pass reads our bundled reference parameters (a demo shortcut). The real skill
                infers timing and easing from recordings instead.
              </p>
              {history.length > 0 && (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {history.map((entry, i) => (
                    <li key={`${entry.summary}-${i}`}>
                      Pass {i + 1}: {entry.summary} · score {entry.score}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Copy editor · Build</CardTitle>
              <CardDescription>Duration, delay, easing, and keyframes for the copy.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-xs">
                  Delay (ms)
                  <Input
                    type="number"
                    value={copySpec.delayMs}
                    onChange={(e) =>
                      setCopySpec((s) => ({ ...s, delayMs: Number(e.target.value) || 0 }))
                    }
                  />
                </label>
                <label className="space-y-1 text-xs">
                  Duration (ms)
                  <Input
                    type="number"
                    value={copySpec.durationMs}
                    onChange={(e) =>
                      setCopySpec((s) => ({ ...s, durationMs: Number(e.target.value) || 1 }))
                    }
                  />
                </label>
              </div>

              <label className="space-y-1 text-xs">
                Easing preset
                <Select value={namedEasingValue} onValueChange={(v) => v && setNamedEasing(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(NAMED_EASINGS).map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">custom bezier</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <div className="grid grid-cols-2 gap-2 text-[0.65rem]">
                {(["x1", "y1", "x2", "y2"] as const).map((key, idx) => (
                  <label key={key} className="space-y-1">
                    {key}
                    <Input
                      type="number"
                      step="0.01"
                      value={easingPoints[idx]}
                      onChange={(e) => {
                        const next = [...easingPoints] as CubicBezier
                        next[idx] = Number(e.target.value)
                        updateEasingPoints(next)
                      }}
                    />
                  </label>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium">Keyframes</p>
                {copySpec.keyframes.map((kf, index) => (
                  <div key={`${kf.offset}-${index}`} className="grid grid-cols-4 gap-2 text-[0.65rem]">
                    <Input
                      type="number"
                      step="0.01"
                      value={kf.offset}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        setCopySpec((s) => ({
                          ...s,
                          keyframes: s.keyframes.map((k, i) =>
                            i === index ? { ...k, offset: val } : k,
                          ),
                        }))
                      }}
                    />
                    <Input
                      type="number"
                      value={kf.translateY}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        setCopySpec((s) => ({
                          ...s,
                          keyframes: s.keyframes.map((k, i) =>
                            i === index ? { ...k, translateY: val } : k,
                          ),
                        }))
                      }}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={kf.opacity}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        setCopySpec((s) => ({
                          ...s,
                          keyframes: s.keyframes.map((k, i) =>
                            i === index ? { ...k, opacity: val } : k,
                          ),
                        }))
                      }}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      value={kf.scale}
                      onChange={(e) => {
                        const val = Number(e.target.value)
                        setCopySpec((s) => ({
                          ...s,
                          keyframes: s.keyframes.map((k, i) =>
                            i === index ? { ...k, scale: val } : k,
                          ),
                        }))
                      }}
                    />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCopySpec((s) => ({
                        ...s,
                        keyframes: [
                          ...s.keyframes,
                          { offset: 1, translateY: 0, opacity: 1, scale: 1 },
                        ],
                      }))
                    }
                  >
                    Add keyframe
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={copySpec.keyframes.length <= 2}
                    onClick={() =>
                      setCopySpec((s) => ({ ...s, keyframes: s.keyframes.slice(0, -1) }))
                    }
                  >
                    Remove last
                  </Button>
                </div>
              </div>

              <Button size="sm" variant="secondary" onClick={copyCss}>
                Copy CSS
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/80 py-4 text-center text-xs text-muted-foreground">
        Reanimate © Niaz Morshed (MIT). This page is an unofficial community demo built in cool-tech.
      </footer>
    </div>
  )
}

function SpecTable({ spec }: { spec: AnimationSpec }) {
  const rows = specTableRows(spec)
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>From → To</TableHead>
          <TableHead>Easing</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.property}>
            <TableCell>{row.property}</TableCell>
            <TableCell>{row.startMs}ms</TableCell>
            <TableCell>{row.durationMs}ms</TableCell>
            <TableCell>
              {row.from} → {row.to}
            </TableCell>
            <TableCell className="text-xs">{row.easing}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
