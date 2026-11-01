export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Effective reduced motion: OS preference or demo switch. */
export function useReducedMotionEffective(
  osReduced: boolean,
  demoReduced: boolean,
): boolean {
  return osReduced || demoReduced
}

export function resolveDisplayPhase(
  phase: 'before' | 'after',
  reduced: boolean,
  animating: boolean,
): 'before' | 'after' {
  if (reduced || !animating) return phase
  return phase
}

/** Instant swap path for reduced motion — no in-between frames. */
export function instantPhaseSwap(
  target: 'before' | 'after',
  reduced: boolean,
): 'before' | 'after' {
  return reduced ? target : target
}
