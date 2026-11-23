/** Shared play/pause/scrub clock — same semantics as examples/three/viewer.js */
export type PlaybackClock = {
  playing: boolean
  base: number
  start: number
  now: () => number
  set: (t: number) => void
  toggle: () => void
}

export function createPlaybackClock(initialPlaying = true): PlaybackClock {
  const clock: PlaybackClock = {
    playing: initialPlaying,
    base: 0,
    start: performance.now() / 1000,
    now() {
      return clock.playing
        ? clock.base + performance.now() / 1000 - clock.start
        : clock.base
    },
    set(t: number) {
      clock.base = t
      clock.start = performance.now() / 1000
    },
    toggle() {
      const t = clock.now()
      clock.playing = !clock.playing
      clock.set(t)
    },
  }
  return clock
}