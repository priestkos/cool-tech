export type TimelineBeat = {
  /** Delay after the previous beat (or start). */
  delayMs: number
  action: () => void
}

export type TimelineController = {
  cancel: () => void
  play: (beats: TimelineBeat[], onComplete?: () => void) => void
  /** Stop motion and snap UI back without playing backwards. */
  snap: (reset: () => void) => void
  isRunning: () => boolean
}

export function createTimeline(): TimelineController {
  const timers: ReturnType<typeof setTimeout>[] = []
  let running = false
  let cancelled = false

  const cancel = () => {
    cancelled = true
    running = false
    for (const timer of timers) clearTimeout(timer)
    timers.length = 0
  }

  const play = (beats: TimelineBeat[], onComplete?: () => void) => {
    cancel()
    cancelled = false
    running = beats.length > 0
    let elapsed = 0
    for (const beat of beats) {
      elapsed += beat.delayMs
      const at = elapsed
      const timer = setTimeout(() => {
        if (cancelled) return
        beat.action()
      }, at)
      timers.push(timer)
    }
    const finishAt = elapsed + (onComplete ? 0 : 0)
    const doneTimer = setTimeout(
      () => {
        if (cancelled) return
        running = false
        onComplete?.()
      },
      finishAt + 16,
    )
    timers.push(doneTimer)
  }

  const snap = (reset: () => void) => {
    cancel()
    reset()
  }

  return {
    cancel,
    play,
    snap,
    isRunning: () => running,
  }
}
