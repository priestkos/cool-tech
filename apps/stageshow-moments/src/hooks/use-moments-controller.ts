import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GRID_STAGGER_MS, PAYOFF_HOLD_MS } from '@/lib/motion'
import { MOMENTS, type MomentDefinition } from '@/lib/moment-registry'
import { prefersReducedMotion, useReducedMotionEffective } from '@/lib/reduced-motion'
import { createTimeline, type TimelineController } from '@/lib/timeline'

export type MomentPhase = 'before' | 'after'

export type MomentRuntime = {
  phase: MomentPhase
  storyStep: number
  animating: boolean
}

const INITIAL: MomentRuntime = { phase: 'before', storyStep: 0, animating: false }

function posterPhase(def: MomentDefinition): MomentPhase {
  return def.poster
}

export function useMomentsController(demoReducedMotion: boolean) {
  const osReduced = prefersReducedMotion()
  const reduced = useReducedMotionEffective(osReduced, demoReducedMotion)
  const timelinesRef = useRef<Map<string, TimelineController>>(new Map())

  const getTimeline = useCallback((id: string) => {
    const map = timelinesRef.current
    if (!map.has(id)) map.set(id, createTimeline())
    return map.get(id)!
  }, [])

  const cancelAll = useCallback(() => {
    for (const tl of timelinesRef.current.values()) tl.cancel()
  }, [])

  const [runtime, setRuntime] = useState<Record<string, MomentRuntime>>(() =>
    Object.fromEntries(MOMENTS.map((m) => [m.id, { ...INITIAL }])),
  )
  const [loadPlayed, setLoadPlayed] = useState(false)

  const setMoment = useCallback((id: string, patch: Partial<MomentRuntime>) => {
    setRuntime((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
  }, [])

  const snapBefore = useCallback(
    (id: string) => {
      setMoment(id, { phase: 'before', storyStep: 0, animating: false })
    },
    [setMoment],
  )

  const showPhase = useCallback(
    (id: string, phase: MomentPhase) => {
      const def = MOMENTS.find((m) => m.id === id)
      if (!def) return
      if (reduced) {
        setMoment(id, {
          phase: phase === 'after' ? posterPhase(def) : 'before',
          storyStep: 0,
          animating: false,
        })
        return
      }
      setMoment(id, { phase, storyStep: 0, animating: false })
    },
    [reduced, setMoment],
  )

  const playStory = useCallback(
    (id: string) => {
      const def = MOMENTS.find((m) => m.id === id)
      if (!def) return
      const tl = getTimeline(id)
      tl.cancel()
      if (reduced) {
        setMoment(id, { phase: posterPhase(def), storyStep: 0, animating: false })
        return
      }
      snapBefore(id)
      setMoment(id, { animating: true })

      const beatsFor = (momentId: string) => {
        switch (momentId) {
          case 'wavelet':
            return [
              { delayMs: 400, action: () => setMoment(id, { storyStep: 1 }) },
              { delayMs: 500, action: () => setMoment(id, { storyStep: 2 }) },
              { delayMs: 350, action: () => setMoment(id, { storyStep: 3 }) },
              { delayMs: 600, action: () => setMoment(id, { storyStep: 4 }) },
              { delayMs: PAYOFF_HOLD_MS, action: () => undefined },
            ]
          case 'dayline':
            return [
              { delayMs: 300, action: () => setMoment(id, { storyStep: 1 }) },
              { delayMs: 400, action: () => setMoment(id, { storyStep: 2 }) },
              { delayMs: 500, action: () => setMoment(id, { storyStep: 3 }) },
              { delayMs: PAYOFF_HOLD_MS, action: () => undefined },
            ]
          case 'tallypay':
            return [
              { delayMs: 250, action: () => setMoment(id, { storyStep: 1 }) },
              { delayMs: 450, action: () => setMoment(id, { storyStep: 2 }) },
              { delayMs: 500, action: () => setMoment(id, { storyStep: 3 }) },
              { delayMs: 400, action: () => setMoment(id, { storyStep: 4 }) },
              { delayMs: PAYOFF_HOLD_MS, action: () => undefined },
            ]
          case 'natter':
            return [
              { delayMs: 350, action: () => setMoment(id, { storyStep: 1 }) },
              { delayMs: 700, action: () => setMoment(id, { storyStep: 2 }) },
              { delayMs: 450, action: () => setMoment(id, { storyStep: 3 }) },
              { delayMs: PAYOFF_HOLD_MS, action: () => undefined },
            ]
          default:
            return [{ delayMs: 200, action: () => undefined }]
        }
      }

      tl.play(beatsFor(id), () => {
        setMoment(id, { phase: 'after', storyStep: 0, animating: false })
      })
    },
    [getTimeline, reduced, setMoment, snapBefore],
  )

  const setAll = useCallback(
    (phase: MomentPhase) => {
      cancelAll()
      for (const m of MOMENTS) {
        if (m.kind === 'stat') continue
        if (phase === 'after' && reduced) {
          setMoment(m.id, { phase: posterPhase(m), storyStep: 0, animating: false })
        } else {
          setMoment(m.id, {
            phase,
            storyStep: 0,
            animating: false,
          })
        }
      }
    },
    [reduced, setMoment],
  )

  useEffect(() => {
    if (loadPlayed || reduced) {
      if (reduced) setAll('after')
      return
    }
    const order = MOMENTS.filter((m) => m.kind !== 'stat')
    const timers: ReturnType<typeof setTimeout>[] = []
    order.forEach((m, index) => {
      timers.push(
        setTimeout(() => playStory(m.id), 400 + index * GRID_STAGGER_MS),
      )
    })
    timers.push(setTimeout(() => setLoadPlayed(true), 400 + order.length * GRID_STAGGER_MS + 4500))
    return () => {
      for (const t of timers) clearTimeout(t)
      cancelAll()
    }
  }, [cancelAll, loadPlayed, playStory, reduced, setAll])

  const displayFor = useCallback(
    (id: string): MomentRuntime => {
      const r = runtime[id] ?? INITIAL
      const def = MOMENTS.find((m) => m.id === id)
      if (!def || def.kind === 'stat') return r
      if (reduced && !r.animating) {
        const phase =
          r.phase === 'after' || r.phase === 'before'
            ? r.phase === 'after'
              ? posterPhase(def)
              : 'before'
            : posterPhase(def)
        return { ...r, phase, storyStep: 0, animating: false }
      }
      return r
    },
    [reduced, runtime],
  )

  return useMemo(
    () => ({
      reduced,
      runtime,
      displayFor,
      showPhase,
      playStory,
      setAll,
      snapBefore,
    }),
    [displayFor, playStory, reduced, runtime, setAll, showPhase, snapBefore],
  )
}
