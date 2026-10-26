import '@hyperframes/player'
import { useEffect, useRef, useState } from 'react'
import type { HyperframesPlayerElement } from '@/hyperframes-player'
import { htmlForPreview } from '@/lib/composition'

type Props = {
  html: string
  width: number
  height: number
  currentTime: number
  onTimeUpdate: (t: number) => void
  onDuration: (d: number) => void
  onReady: (player: HyperframesPlayerElement) => void
  previewKey: string
}

export function CompositionPreview({
  html,
  width,
  height,
  currentTime,
  onTimeUpdate,
  onDuration,
  onReady,
  previewKey,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HyperframesPlayerElement | null>(null)
  const [srcdoc, setSrcdoc] = useState('')
  const scrubbingRef = useRef(false)

  useEffect(() => {
    setSrcdoc(htmlForPreview(html))
  }, [html, previewKey])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const el = host.querySelector('hyperframes-player') as HyperframesPlayerElement | null
    playerRef.current = el
    if (!el) return

    const onReadyEv = () => {
      onDuration(el.duration || 0)
      onReady(el)
      el.seek(0)
    }
    const onTime = () => {
      if (!scrubbingRef.current) onTimeUpdate(el.currentTime)
    }

    el.addEventListener('ready', onReadyEv)
    el.addEventListener('timeupdate', onTime)
    return () => {
      el.removeEventListener('ready', onReadyEv)
      el.removeEventListener('timeupdate', onTime)
    }
  }, [previewKey, onDuration, onReady, onTimeUpdate])

  useEffect(() => {
    const el = playerRef.current
    if (!el || !el.duration) return
    if (Math.abs(el.currentTime - currentTime) > 0.02) {
      el.seek(currentTime)
    }
  }, [currentTime])

  const aspect = width / height
  const maxW = 640
  const displayW = maxW
  const displayH = Math.round(maxW / aspect)

  return (
    <div
      ref={hostRef}
      className="mx-auto overflow-hidden rounded-lg border bg-black shadow-sm"
      style={{ width: displayW, height: displayH }}
    >
      <hyperframes-player
        key={previewKey}
        srcdoc={srcdoc}
        width={width}
        height={height}
        assets-loading-ui="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  )
}
