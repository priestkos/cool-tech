import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MOMENTS, type MomentDefinition } from '@/lib/moment-registry'
import {
  DAYLINE_PLAY_MS,
} from '@/moments/dayline-stage'
import { NATTER_PLAY_MS } from '@/moments/natter-stage'
import { TALLYPAY_PLAY_MS } from '@/moments/tallypay-stage'
import { WAVELET_PLAY_MS } from '@/moments/wavelet-stage'

export type MomentPhase = 'before' | 'after'

export type MomentRuntime = {
  phase: MomentPhase
  playKey: number
  playing: boolean
}

const INITIAL: MomentRuntime = { phase: 'before', playKey: 0, playing: false }

const GRID_STAGGER_MS = 100

function posterPhase(def: MomentDefinition): MomentPhase {
  return def.poster
}

function playDuration(id: string): number {
  switch (id) {
    case 'wavelet':
      return WAVELET_PLAY_MS
    case 'dayline':
      return DAYLINE_PLAY_MS
    case 'tallypay':
      return TALLYPAY_PLAY_MS
    case 'natter':
      return NATTER_PLAY_MS
    default:
      return 1200
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useMomentsController(demoReducedMotion: boolean) {
  const reduced = demoReducedMotion || prefersReducedMotion()
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t)
    timersRef.current = []
  }, [])

  const [runtime, setRuntime] = useState<Record<string, MomentRuntime>>(() =>
    Object.fromEntries(MOMENTS.map((m) => [m.id, { ...INITIAL }])),
  )
  const [loadPlayed, setLoadPlayed] = useState(false)

  const setMoment = useCallback((id: string, patch: Partial<MomentRuntime>) => {
    setRuntime((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }, [])

  const showPhase = useCallback(
    (id: string, phase: MomentPhase) => {
      const def = MOMENTS.find((m) => m.id === id)
      if (!def) return
      if (reduced && phase === 'after') {
        setMoment(id, {
          phase: posterPhase(def),
          playKey: runtime[id]?.playKey ?? 0,
          playing: false,
        })
        return
      }
      setMoment(id, {
        phase,
        playKey: runtime[id]?.playKey ?? 0,
        playing: false,
      })
    },
    [reduced, runtime, setMoment],
  )

  const playStory = useCallback(
    (id: string) => {
      const def = MOMENTS.find((m) => m.id === id)
      if (!def || def.kind === 'stat') return
      if (reduced) {
        setMoment(id, {
          phase: posterPhase(def),
          playKey: (runtime[id]?.playKey ?? 0) + 1,
          playing: false,
        })
        return
      }
      const nextKey = (runtime[id]?.playKey ?? 0) + 1
      setMoment(id, { phase: 'before', playKey: nextKey, playing: true })
      const end = setTimeout(() => {
        setMoment(id, { phase: 'after', playKey: nextKey, playing: false })
      }, playDuration(id))
      timersRef.current.push(end)
    },
    [reduced, runtime, setMoment],
  )

  const setAll = useCallback(
    (phase: MomentPhase) => {
      clearTimers()
      for (const m of MOMENTS) {
        if (m.kind === 'stat') continue
        if (phase === 'after' && reduced) {
          setMoment(m.id, {
            phase: posterPhase(m),
            playKey: runtime[m.id]?.playKey ?? 0,
            playing: false,
          })
        } else {
          setMoment(m.id, {
            phase,
            playKey: runtime[m.id]?.playKey ?? 0,
            playing: false,
          })
        }
      }
    },
    [clearTimers, reduced, runtime, setMoment],
  )

  useEffect(() => {
    if (loadPlayed || reduced) {
      if (reduced) setAll('after')
      return
    }
    const order = MOMENTS.filter((m) => m.kind !== 'stat')
    order.forEach((m, index) => {
      const start = setTimeout(() => playStory(m.id), 400 + index * GRID_STAGGER_MS)
      timersRef.current.push(start)
    })
    const done = setTimeout(
      () => setLoadPlayed(true),
      400 + order.length * GRID_STAGGER_MS + 5000,
    )
    timersRef.current.push(done)
    return () => clearTimers()
  }, [clearTimers, loadPlayed, playStory, reduced, setAll])

  const displayFor = useCallback(
    (id: string): MomentRuntime => runtime[id] ?? INITIAL,
    [runtime],
  )

  return useMemo(
    () => ({
      reduced,
      displayFor,
      showPhase,
      playStory,
      setAll,
    }),
    [displayFor, playStory, reduced, setAll, showPhase],
  )
}