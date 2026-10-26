import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'

import { ChannelStripRow } from '@/components/ChannelStripRow'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChannelStrip,
  ChannelStripControls,
  ChannelStripFader,
  ChannelStripHeader,
  ChannelStripTitle,
  ChannelStripValue,
} from '@/components/ui/channel-strip'
import { ClipIndicator } from '@/components/ui/clip-indicator'
import { MuteToggle } from '@/components/ui/channel-toggle'
import { DbReadout } from '@/components/ui/db-readout'
import {
  Fader,
  FaderRange,
  FaderThumb,
  FaderTrack,
} from '@/components/ui/fader'
import { LcdDisplay, LcdDisplayRow, LcdDisplayLabel } from '@/components/ui/lcd-display'
import { LcdMeter } from '@/components/ui/lcd-meter'
import {
  Mixer,
  MixerChannels,
  MixerHeader,
  MixerMaster,
  MixerSeparator,
  MixerTitle,
} from '@/components/ui/mixer'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useAudioContext } from '@/hooks/use-audio-context'
import { useMicrophone } from '@/hooks/use-microphone'
import { useMixer } from '@/hooks/use-mixer'
import { useWebAudioMixer } from '@/hooks/use-web-audio-mixer'
import { createDrumLoopBuffer } from '@/lib/drum-loop'
const CHANNELS = [
  { id: 'tone', gainDb: -18, monitor: true },
  { id: 'drums', gainDb: -12, monitor: true },
  { id: 'mic', gainDb: 0, monitor: false },
  { id: 'file', gainDb: -6, monitor: true },
] as const

type ChannelId = (typeof CHANNELS)[number]['id']

export function MixerBoard() {
  const { context, status, resume } = useAudioContext()
  const [audioReady, setAudioReady] = useState(false)
  const [toneHz, setToneHz] = useState(440)
  const [toneNode, setToneNode] = useState<OscillatorNode | null>(null)
  const [drumNode, setDrumNode] = useState<AudioBufferSourceNode | null>(null)
  const drumBufferRef = useRef<AudioBuffer | null>(null)
  const fileAudioRef = useRef<HTMLAudioElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [fileElement, setFileElement] = useState<HTMLAudioElement | null>(null)
  const [fileLabel, setFileLabel] = useState<string | null>(null)
  const [filePlaying, setFilePlaying] = useState(false)
  const [micMonitor, setMicMonitor] = useState(false)

  const microphone = useMicrophone({ enabled: false })
  const mixer = useMixer({ channels: [...CHANNELS] })
  const { theme, setTheme } = useTheme()

  const graph = useWebAudioMixer(mixer, {
    enabled: audioReady,
    inputs: {
      tone: toneNode,
      drums: drumNode,
      mic: microphone.stream,
      file: fileElement,
    },
  })

  const startAudio = useCallback(async () => {
    await resume()
    setAudioReady(true)
  }, [resume])

  useEffect(() => {
    if (!audioReady || !context) {
      return
    }
    const osc = context.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = toneHz
    osc.start()
    setToneNode(osc)
    return () => {
      osc.stop()
      setToneNode(null)
    }
  }, [audioReady, context])

  useEffect(() => {
    if (!toneNode) {
      return
    }
    toneNode.frequency.value = toneHz
  }, [toneHz, toneNode])

  useEffect(() => {
    if (!audioReady || !context) {
      return
    }
    if (!drumBufferRef.current) {
      drumBufferRef.current = createDrumLoopBuffer(context)
    }
    const source = context.createBufferSource()
    source.buffer = drumBufferRef.current
    source.loop = true
    source.start()
    setDrumNode(source)
    return () => {
      source.stop()
      setDrumNode(null)
    }
  }, [audioReady, context])

  const meterFor = (id: ChannelId) =>
    graph.meters[id] ?? graph.master.meter

  const onPickFile = useCallback((file: File | null) => {
    if (!fileAudioRef.current) {
      return
    }
    if (!file) {
      fileAudioRef.current.pause()
      fileAudioRef.current.removeAttribute('src')
      setFileLabel(null)
      setFilePlaying(false)
      return
    }
    const url = URL.createObjectURL(file)
    fileAudioRef.current.src = url
    fileAudioRef.current.loop = true
    setFileLabel(file.name)
    void fileAudioRef.current.play().then(() => setFilePlaying(true))
  }, [])

  const statusLabel =
    status === 'running'
      ? 'Running'
      : status === 'suspended'
        ? 'Suspended'
        : status === 'closed'
          ? 'Closed'
          : 'Unsupported'

  const statusVariant =
    status === 'running' ? 'default' : ('secondary' as const)

  return (
    <div
      className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 p-4 md:p-8"
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDrop={(e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file?.type.startsWith('audio/')) {
          onPickFile(file)
        }
      }}
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Audio Mixer Board
          </h1>
          <p className="text-muted-foreground text-sm">
            Four sources, one desk — built with{' '}
            <a
              className="underline underline-offset-2"
              href="https://www.audiocn.dev"
              rel="noreferrer"
              target="_blank"
            >
              audiocn
            </a>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant}>{statusLabel}</Badge>
          <Button disabled={audioReady && status === 'running'} onClick={() => void startAudio()}>
            Start audio
          </Button>
          <Button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            size="icon"
            variant="outline"
          >
            <HugeiconsIcon
              icon={theme === 'dark' ? Sun03Icon : Moon02Icon}
              size={18}
              strokeWidth={1.75}
            />
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mixer</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Mixer className="min-w-[56rem]" orientation="horizontal">
            <MixerHeader>
              <MixerTitle>Channels</MixerTitle>
            </MixerHeader>
            <MixerChannels className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <ChannelStripRow
                disabled={!audioReady}
                headerExtra={
                  <div className="mt-2 space-y-1">
                    <label className="text-muted-foreground text-xs" htmlFor="tone-hz">
                      {toneHz} Hz
                    </label>
                    <Slider
                      disabled={!audioReady}
                      id="tone-hz"
                      max={880}
                      min={220}
                      onValueChange={(v) => {
                        const next = Array.isArray(v) ? v[0] : v
                        if (typeof next === 'number') setToneHz(next)
                      }}
                      step={1}
                      value={[toneHz]}
                    />
                  </div>
                }
                id="tone"
                meter={meterFor('tone')}
                mixer={mixer}
                title="Test tone"
              />
              <ChannelStripRow
                disabled={!audioReady}
                id="drums"
                meter={meterFor('drums')}
                mixer={mixer}
                title="Drum loop"
              />
              <ChannelStripRow
                disabled={!audioReady}
                headerExtra={
                  <Button
                    className="mt-1"
                    disabled={!audioReady}
                    onClick={() =>
                      microphone.status === 'active'
                        ? microphone.stop()
                        : void microphone.start()
                    }
                    size="xs"
                    variant="outline"
                  >
                    {microphone.status === 'active' ? 'Stop mic' : 'Open mic'}
                  </Button>
                }
                id="mic"
                meter={meterFor('mic')}
                mixer={mixer}
                notice={
                  microphone.status === 'denied'
                    ? 'Microphone blocked — allow access in browser settings or use a fake device.'
                    : microphone.status === 'unavailable'
                      ? 'No microphone found.'
                      : null
                }
                showMonitor={false}
                title="Microphone"
              />
              <ChannelStripRow
                disabled={!audioReady}
                headerExtra={
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Button
                      disabled={!audioReady}
                      onClick={() => fileInputRef.current?.click()}
                      size="xs"
                      variant="outline"
                    >
                      Choose file
                    </Button>
                    {fileLabel ? (
                      <Button
                        disabled={!audioReady}
                        onClick={() => {
                          const el = fileAudioRef.current
                          if (!el) return
                          if (el.paused) {
                            void el.play()
                            setFilePlaying(true)
                          } else {
                            el.pause()
                            setFilePlaying(false)
                          }
                        }}
                        size="xs"
                        variant="secondary"
                      >
                        {filePlaying ? 'Pause' : 'Play'}
                      </Button>
                    ) : null}
                  </div>
                }
                id="file"
                meter={meterFor('file')}
                mixer={mixer}
                notice={
                  fileLabel
                    ? `Playing: ${fileLabel}`
                    : 'Drop an audio file on the page or choose one.'
                }
                title="Audio file"
              />
            </MixerChannels>
            <MixerSeparator />
            <MixerMaster>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <LcdDisplay className="min-w-[18rem] flex-1" size="sm">
                  <LcdDisplayRow>
                    <LcdDisplayLabel>Master</LcdDisplayLabel>
                  </LcdDisplayRow>
                  <LcdMeter
                    channelCount={2}
                    maxDb={6}
                    minDb={-48}
                    source={graph.master.meter}
                  />
                </LcdDisplay>
                <ChannelStrip className="w-32" variant="master">
                  <ChannelStripHeader>
                    <ChannelStripTitle>Master</ChannelStripTitle>
                  </ChannelStripHeader>
                  <ChannelStripFader>
                    <Fader
                      aria-label="Master volume"
                      max={6}
                      min={-60}
                      onValueChange={(v) => mixer.setMasterGain(v)}
                      orientation="vertical"
                      silenceAtMin
                      size="sm"
                      taper="audio"
                      value={mixer.master.gainDb}
                    >
                      <FaderTrack>
                        <FaderRange />
                        <FaderThumb />
                      </FaderTrack>
                    </Fader>
                  </ChannelStripFader>
                  <ChannelStripValue>
                    <DbReadout
                      floorDb={-60}
                      value={mixer.master.gainDb}
                    />
                  </ChannelStripValue>
                  <ChannelStripControls className="flex flex-col items-center gap-2">
                    <MuteToggle
                      aria-label="Mute master"
                      onPressedChange={(m) => mixer.setMasterMuted(m)}
                      pressed={mixer.master.muted}
                      size="sm"
                    >
                      M
                    </MuteToggle>
                    <ClipIndicator showCount source={graph.master.meter}>
                      CLIP
                    </ClipIndicator>
                  </ChannelStripControls>
                </ChannelStrip>
              </div>
            </MixerMaster>
          </Mixer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={micMonitor}
              disabled={!audioReady}
              onCheckedChange={(checked) => {
                setMicMonitor(checked)
                mixer.setMonitor('mic', checked)
              }}
            />
            Monitor mic (use headphones)
          </label>
          <p className="text-muted-foreground text-xs">
            Sounds are synthesized in-browser — no copyrighted samples.
          </p>
        </CardContent>
      </Card>

      <footer className="text-muted-foreground border-t pt-4 text-center text-xs">
        UI components from{' '}
        <a
          className="underline underline-offset-2"
          href="https://github.com/audiocn/ui"
          rel="noreferrer"
          target="_blank"
        >
          audiocn
        </a>{' '}
        (MIT) · OrcDev
      </footer>

      <audio
        className="hidden"
        loop
        ref={(node) => {
          fileAudioRef.current = node
          setFileElement(node)
        }}
      />
      <input
        accept="audio/*"
        className="hidden"
        onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        ref={fileInputRef}
        type="file"
      />
    </div>
  )
}
