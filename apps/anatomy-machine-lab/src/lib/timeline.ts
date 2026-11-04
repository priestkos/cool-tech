export type PlaybackState = {
  simTime: number
  playing: boolean
  speed: number
  maxTime: number
}

export const SPEEDS = [0.25, 0.5, 1, 2, 4] as const

export function clampTime(t: number, maxTime: number): number {
  if (Number.isNaN(t)) return 0
  return Math.min(Math.max(0, t), maxTime)
}

export function advancePlayback(
  state: PlaybackState,
  deltaWallSeconds: number,
): PlaybackState {
  if (!state.playing || deltaWallSeconds <= 0) return state
  const next = state.simTime + deltaWallSeconds * state.speed
  return { ...state, simTime: clampTime(next, state.maxTime) }
}

export function scrubPlayback(state: PlaybackState, t: number): PlaybackState {
  return { ...state, simTime: clampTime(t, state.maxTime) }
}

export function resetPlayback(maxTime: number): PlaybackState {
  return { simTime: 0, playing: false, speed: 1, maxTime }
}

export function togglePlay(state: PlaybackState): PlaybackState {
  return { ...state, playing: !state.playing }
}

export function setSpeed(state: PlaybackState, speed: number): PlaybackState {
  return { ...state, speed }
}

export function cycleSpeed(state: PlaybackState): PlaybackState {
  const idx = SPEEDS.indexOf(state.speed as (typeof SPEEDS)[number])
  const next = SPEEDS[(idx + 1) % SPEEDS.length]
  return { ...state, speed: next }
}
