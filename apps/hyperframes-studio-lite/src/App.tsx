import { PauseIcon, PlayIcon, RotateCcwIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { CompositionPreview } from '@/components/CompositionPreview'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/sonner'
import type { HyperframesPlayerElement } from '@/hyperframes-player'
import {
  formatTimecode,
  parseCompositionMeta,
  validateComposition,
} from '@/lib/composition'
import {
  DEFAULT_TEMPLATE_ID,
  getTemplate,
  TEMPLATES,
  type TemplateId,
} from '@/lib/templates'

type Capabilities = {
  hyperframesVersion: string
  ffmpeg: boolean
  chrome: boolean
  canRender: boolean
  renderNotice: string | null
  ffmpegDetail: string | null
  chromeDetail: string | null
}

export default function App() {
  const [templateId, setTemplateId] = useState<TemplateId>(DEFAULT_TEMPLATE_ID)
  const [html, setHtml] = useState(() => getTemplate(DEFAULT_TEMPLATE_ID).html)
  const [debouncedHtml, setDebouncedHtml] = useState(html)
  const [previewKey, setPreviewKey] = useState('0')
  const [currentTime, setCurrentTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [caps, setCaps] = useState<Capabilities | null>(null)
  const [renderId, setRenderId] = useState<string | null>(null)
  const [renderStatus, setRenderStatus] = useState<string | null>(null)
  const [renderLog, setRenderLog] = useState('')
  const [renderError, setRenderError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const playerRef = useRef<HyperframesPlayerElement | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const meta = useMemo(() => parseCompositionMeta(debouncedHtml), [debouncedHtml])
  const validation = useMemo(() => validateComposition(debouncedHtml), [debouncedHtml])

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedHtml(html)
      setPreviewKey(String(Date.now()))
      setCurrentTime(0)
      setPlaying(false)
    }, 350)
    return () => clearTimeout(t)
  }, [html])

  useEffect(() => {
    fetch('/api/capabilities')
      .then((r) => r.json())
      .then((data: Capabilities) => setCaps(data))
      .catch(() => setCaps(null))
  }, [])

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  const selectTemplate = (id: TemplateId) => {
    setTemplateId(id)
    setHtml(getTemplate(id).html)
  }

  const resetTemplate = () => {
    setHtml(getTemplate(templateId).html)
    toast.message('Reset to template')
  }

  const onPlayerReady = useCallback((player: HyperframesPlayerElement) => {
    playerRef.current = player
  }, [])

  const togglePlay = () => {
    const player = playerRef.current
    if (!player) return
    if (playing) {
      player.pause()
      setPlaying(false)
    } else {
      void player.play()
      setPlaying(true)
    }
  }

  const seekTo = (value: number) => {
    setCurrentTime(value)
    playerRef.current?.seek(value)
  }

  const startRender = async () => {
    if (!caps?.canRender) {
      toast.error(caps?.renderNotice ?? 'Render unavailable on this machine.')
      return
    }
    if (!validation.ok) {
      toast.error('Fix composition issues before rendering.')
      return
    }

    setRenderError(null)
    setRenderLog('')
    setVideoUrl(null)
    setRenderStatus('starting')

    const res = await fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html: debouncedHtml }),
    })
    const data = await res.json()
    if (!res.ok) {
      setRenderError(data.error ?? 'Render rejected')
      setRenderStatus('error')
      return
    }

    const id = data.id as string
    setRenderId(id)
    setRenderStatus('queued')

    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(async () => {
      const st = await fetch(`/api/render/${id}`)
      const job = await st.json()
      setRenderStatus(job.status)
      setRenderLog(job.logTail ?? '')
      if (job.status === 'done') {
        if (pollRef.current) clearInterval(pollRef.current)
        const url = `/api/render/${id}/video`
        setVideoUrl(url)
        toast.success('MP4 render complete')
      }
      if (job.status === 'error') {
        if (pollRef.current) clearInterval(pollRef.current)
        setRenderError(job.error ?? 'Render failed')
        toast.error('Render failed')
      }
    }, 1200)
  }

  const duration = meta.duration || playerRef.current?.duration || 0
  const sliderMax = Math.max(duration, 0.1)

  return (
    <div className="min-h-screen bg-muted/30">
      <Toaster richColors position="top-center" />
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">HyperFrames Studio Lite</h1>
            <p className="text-muted-foreground text-sm">
              Pick a template, edit HTML, scrub the timeline, render a deterministic MP4 locally.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">HyperFrames {caps?.hyperframesVersion ?? '…'}</Badge>
            {caps && (
              <>
                <Badge variant={caps.ffmpeg ? 'default' : 'destructive'}>
                  FFmpeg {caps.ffmpeg ? 'ready' : 'missing'}
                </Badge>
                <Badge variant={caps.chrome ? 'default' : 'destructive'}>
                  Chrome {caps.chrome ? 'ready' : 'missing'}
                </Badge>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates &amp; HTML</CardTitle>
              <CardDescription>
                Compositions use GSAP timelines on <code>window.__timelines</code> (served locally).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs
                value={templateId}
                onValueChange={(v) => selectTemplate(v as TemplateId)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  {TEMPLATES.map((t) => (
                    <TabsTrigger key={t.id} value={t.id} className="text-xs sm:text-sm">
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {TEMPLATES.map((t) => (
                  <TabsContent key={t.id} value={t.id} className="text-muted-foreground text-sm">
                    {t.description}
                  </TabsContent>
                ))}
              </Tabs>

              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={resetTemplate}>
                  <HugeiconsIcon icon={RotateCcwIcon} strokeWidth={2} className="size-4" />
                  Reset to template
                </Button>
              </div>

              <textarea
                className="h-[420px] w-full resize-y rounded-md border bg-background p-3 font-mono text-xs leading-relaxed shadow-inner"
                spellCheck={false}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                aria-label="Composition HTML"
              />

              {!validation.ok && (
                <Alert variant="destructive">
                  <AlertTitle>Composition issues</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-4">
                      {validation.issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Render</CardTitle>
              <CardDescription>Spawns the HyperFrames CLI under Bun (one job at a time).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {caps && !caps.canRender && (
                <Alert>
                  <AlertTitle>Render unavailable</AlertTitle>
                  <AlertDescription>{caps.renderNotice}</AlertDescription>
                </Alert>
              )}
              <Button
                type="button"
                disabled={!caps?.canRender || !validation.ok || renderStatus === 'running'}
                onClick={() => void startRender()}
              >
                Render MP4
              </Button>
              {renderStatus && (
                <p className="text-muted-foreground text-sm">
                  Status: <span className="font-medium text-foreground">{renderStatus}</span>
                  {renderId ? ` · ${renderId.slice(0, 8)}` : null}
                </p>
              )}
              {renderLog && (
                <ScrollArea className="h-24 rounded-md border bg-muted/40 p-2 font-mono text-xs">
                  {renderLog}
                </ScrollArea>
              )}
              {renderError && (
                <Alert variant="destructive">
                  <AlertTitle>Render error</AlertTitle>
                  <AlertDescription>{renderError}</AlertDescription>
                </Alert>
              )}
              {videoUrl && (
                <div className="space-y-2">
                  <video src={videoUrl} controls className="w-full rounded-md border bg-black" />
                  <a
                    className="text-primary text-sm underline"
                    href={videoUrl}
                    download={`hyperframes-${renderId ?? 'out'}.mp4`}
                  >
                    Download MP4
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Live preview</CardTitle>
              <CardDescription>
                <code>&lt;hyperframes-player&gt;</code> with <code>srcdoc</code> (official web component).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CompositionPreview
                html={debouncedHtml}
                width={meta.width}
                height={meta.height}
                currentTime={currentTime}
                onTimeUpdate={setCurrentTime}
                onDuration={() => {}}
                onReady={onPlayerReady}
                previewKey={previewKey}
              />

              <div className="flex items-center gap-3">
                <Button type="button" size="icon" variant="outline" onClick={togglePlay}>
                  <HugeiconsIcon
                    icon={playing ? PauseIcon : PlayIcon}
                    strokeWidth={2}
                    className="size-4"
                  />
                </Button>
                <div className="flex-1 space-y-2">
                  <Slider
                    min={0}
                    max={sliderMax}
                    step={1 / (meta.fps || 30)}
                    value={[Math.min(currentTime, sliderMax)]}
                    onValueChange={(v) => {
                      const next = Array.isArray(v) ? v[0] : v
                      seekTo(typeof next === 'number' ? next : 0)
                    }}
                  />
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>{formatTimecode(currentTime, meta.fps)}</span>
                    <span>
                      {duration > 0 ? formatTimecode(duration, meta.fps) : '—'} @ {meta.fps} fps
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Environment</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-2 text-sm">
              {caps?.ffmpegDetail && <p>FFmpeg: {caps.ffmpegDetail}</p>}
              {caps?.chromeDetail && <p>Chrome: {caps.chromeDetail}</p>}
              <p>
                Preview works without FFmpeg or Chrome. Rendering needs both; install Chrome with{' '}
                <code className="text-foreground">bunx hyperframes browser ensure</code> if missing.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t py-6 text-center text-muted-foreground text-xs">
        <p>
          <a className="underline" href="https://github.com/heygen-com/hyperframes">HyperFrames</a>{' '}
          (Apache-2.0) ·{' '}
          <a className="underline" href="https://hyperframes.heygen.com/introduction">Docs</a> ·{' '}
          <a className="underline" href="https://x.com/GitRanks/status/2113295563768602750">Buzz</a> ·
          Animations use{' '}
          <a className="underline" href="https://gsap.com/standard-license">GSAP Standard (no-charge)</a>
        </p>
      </footer>
    </div>
  )
}
