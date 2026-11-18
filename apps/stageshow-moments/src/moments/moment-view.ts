export type MomentViewMode = 'before' | 'after' | 'play'

export function resolveMomentMode(
  phase: 'before' | 'after',
  playing: boolean,
): MomentViewMode {
  if (playing) return 'play'
  return phase
}