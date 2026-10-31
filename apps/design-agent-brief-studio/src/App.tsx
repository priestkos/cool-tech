import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DeckPreview } from '@/components/DeckPreview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BRAND_KITS, getBrandKit, type BrandKitId } from '@/lib/brands'
import { runBrandChecks, type BrandCheck } from '@/lib/brand-checks'
import { buildDeckHtml } from '@/lib/build-deck'
import { downloadDeckHtml } from '@/lib/export-deck'
import { DECK_FORMATS, getFormat, type DeckFormatId } from '@/lib/formats'
import { fontFacesForKit } from '@/lib/font-data'
import { buildSlidePlan, parseBrief, type Slide } from '@/lib/parse-brief'
import { SAMPLE_BRIEFS } from '@/lib/samples'

const DEFAULT_BRIEF = SAMPLE_BRIEFS[0].text

function CheckRow({ check }: { check: BrandCheck }) {
  const variant =
    check.severity === 'pass' ? 'default' : check.severity === 'warn' ? 'secondary' : 'destructive'
  return (
    <div className="flex flex-col gap-1 border-b py-2 last:border-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{check.label}</span>
        <Badge variant={variant}>{check.severity}</Badge>
      </div>
      <p className="text-xs text-muted-foreground">{check.detail}</p>
    </div>
  )
}

export default function App() {
  const [brief, setBrief] = useState<string>(DEFAULT_BRIEF)
  const [kitId, setKitId] = useState<BrandKitId>('example-studio')
  const [formatId, setFormatId] = useState<DeckFormatId>('slide')
  const [slideCount, setSlideCount] = useState(5)
  const [customAccent, setCustomAccent] = useState('')
  const [slides, setSlides] = useState<Slide[]>(() => {
    const outline = parseBrief(DEFAULT_BRIEF)
    return buildSlidePlan(outline, 5)
  })
  const [outline, setOutline] = useState(() => parseBrief(DEFAULT_BRIEF))
  const [slideIndex, setSlideIndex] = useState(0)
  const [parseError, setParseError] = useState<string | null>(null)

  const kit = getBrandKit(kitId)
  const format = getFormat(formatId)

  const deckHtml = useMemo(
    () =>
      buildDeckHtml({
        kit,
        format,
        slides,
        fontFaces: fontFacesForKit(kit),
        customAccent: customAccent || null,
        showMockBadge: true,
        exportMode: false,
        initialSlideIndex: slideIndex,
      }),
    [kit, format, slides, customAccent, slideIndex],
  )

  const checks = useMemo(
    () =>
      runBrandChecks({
        kit,
        outline,
        customAccent: customAccent || null,
        deckRadiusPx: 8,
      }),
    [kit, outline, customAccent],
  )

  const generate = () => {
    try {
      const nextOutline = parseBrief(brief)
      const nextSlides = buildSlidePlan(nextOutline, slideCount)
      setOutline(nextOutline)
      setSlides(nextSlides)
      setSlideIndex(0)
      setParseError(null)
      toast.success('Mock deck generated (deterministic templates)')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not parse brief'
      setParseError(msg)
      toast.error(msg)
    }
  }

  const restyleOnly = (nextKitId: BrandKitId) => {
    setKitId(nextKitId)
    toast.message('Same outline, new brand tokens applied')
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b px-4 py-3">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Design Agent Brief Studio</h1>
              <p className="text-xs text-muted-foreground">
                Unofficial demo inspired by LangChain&apos;s Design Agent. Not made by or affiliated
                with LangChain; no AI runs here (mock mode).
              </p>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              Mock mode: scripted templates, no AI
            </Badge>
          </div>
        </header>

        <main className="mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Brief</CardTitle>
                <CardDescription>
                  Type a short brief or pick a sample. Generation is deterministic mock templating.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_BRIEFS.map((s) => (
                    <Button
                      key={s.id}
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setBrief(s.text)}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
                <Textarea
                  value={brief}
                  onChange={(e) => setBrief(e.target.value.slice(0, 2000))}
                  rows={12}
                  className="font-mono text-sm"
                  aria-label="Creative brief"
                />
                <p className="text-right text-xs text-muted-foreground">{brief.length}/2000</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label>Slides</Label>
                    <Select
                      value={String(slideCount)}
                      onValueChange={(v) => setSlideCount(Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7, 8].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n} slides
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label>Format</Label>
                    <Select value={formatId} onValueChange={(v) => setFormatId(v as DeckFormatId)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DECK_FORMATS.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {parseError ? <p className="text-sm text-destructive">{parseError}</p> : null}
                <Button type="button" onClick={generate}>
                  Generate (mock)
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brand kit</CardTitle>
                <CardDescription>Local kits with --brand-* tokens and OFL fonts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Tabs value={kitId} onValueChange={(v) => restyleOnly(v as BrandKitId)}>
                  <TabsList className="w-full flex-wrap h-auto">
                    {BRAND_KITS.map((k) => (
                      <TabsTrigger key={k.id} value={k.id} className="text-xs">
                        {k.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {BRAND_KITS.map((k) => (
                    <TabsContent key={k.id} value={k.id}>
                      <p className="text-sm text-muted-foreground">{k.voice}</p>
                    </TabsContent>
                  ))}
                </Tabs>
                <div className="space-y-1">
                  <Label htmlFor="accent">Custom accent (optional)</Label>
                  <Input
                    id="accent"
                    placeholder="#ff0000"
                    value={customAccent}
                    onChange={(e) => setCustomAccent(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Try a banned colour like #ff0000 to see brand checks fail.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real mode (not exercised)</CardTitle>
                <CardDescription>
                  The production agent is{' '}
                  <a
                    className="underline"
                    href="https://github.com/langchain-ai/design-agent"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LangChain Design Agent
                  </a>{' '}
                  (Slack, LangSmith, model keys). This page does not call it.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    Sandboxed iframe (allow-scripts only). User text is escaped.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    downloadDeckHtml(kit, format, slides, customAccent || null)
                    toast.success('Downloaded self-contained HTML')
                  }}
                >
                  Export HTML
                </Button>
              </CardHeader>
              <CardContent>
                <DeckPreview
                  html={deckHtml}
                  format={format}
                  slideIndex={slideIndex}
                  onSlideIndexChange={setSlideIndex}
                  slideCount={slides.length}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brand checks</CardTitle>
                <CardDescription>Palette, radius, contrast and headline length.</CardDescription>
              </CardHeader>
              <CardContent>
                {checks.map((c) => (
                  <CheckRow key={c.id} check={c} />
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
