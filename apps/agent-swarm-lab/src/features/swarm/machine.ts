import type { SwarmPhase, SwarmRuntimeState, TriggerMode } from "./types"

export const INITIAL_SWARM_STATE: SwarmRuntimeState = {
  phase: "idle",
  runId: 0,
  phaseProgress: 0,
  typeProgress: 0,
  frameProgress: 0,
  scanProgress: 0,
  playing: false,
}

const PHASE_DURATIONS_MS: Record<Exclude<SwarmPhase, "idle" | "complete">, number> =
  {
    enter: 420,
    frame: 900,
    scan: 520,
    type: 1100,
    exit: 380,
  }

export function scaleDuration(baseMs: number, speed: number): number {
  const clamped = Math.min(3, Math.max(0.35, speed))
  return baseMs / clamped
}

export function shouldAutoStart(
  mode: TriggerMode,
  opts: { mounted: boolean; visible: boolean; manualSignal: number },
): boolean {
  switch (mode) {
    case "mount":
      return opts.mounted
    case "visible":
      return opts.visible
    case "manual":
      return opts.manualSignal > 0
    default: {
      const _exhaustive: never = mode
      return _exhaustive
    }
  }
}

export function completeImmediately(
  state: SwarmRuntimeState,
): SwarmRuntimeState {
  return {
    ...state,
    phase: "complete",
    playing: false,
    phaseProgress: 1,
    typeProgress: 1,
    frameProgress: 1,
    scanProgress: 1,
  }
}

export function beginRun(state: SwarmRuntimeState): SwarmRuntimeState {
  return {
    phase: "enter",
    runId: state.runId + 1,
    phaseProgress: 0,
    typeProgress: 0,
    frameProgress: 0,
    scanProgress: 0,
    playing: true,
  }
}

export function replay(state: SwarmRuntimeState): SwarmRuntimeState {
  return beginRun({
    ...INITIAL_SWARM_STATE,
    runId: state.runId,
  })
}

export function resetSwarm(): SwarmRuntimeState {
  return { ...INITIAL_SWARM_STATE }
}

function nextPhase(phase: SwarmPhase): SwarmPhase {
  if (phase === "idle") return "enter"
  if (phase === "enter") return "frame"
  if (phase === "frame") return "scan"
  if (phase === "scan") return "type"
  if (phase === "type") return "exit"
  if (phase === "exit") return "complete"
  return "complete"
}

export function tickSwarm(
  state: SwarmRuntimeState,
  deltaMs: number,
  speed: number,
  reducedMotion: boolean,
): SwarmRuntimeState {
  if (reducedMotion) {
    return completeImmediately(state)
  }
  if (!state.playing || state.phase === "complete" || state.phase === "idle") {
    return state
  }

  const phase = state.phase as Exclude<SwarmPhase, "idle" | "complete">

  const duration = scaleDuration(PHASE_DURATIONS_MS[phase], speed)
  const nextProgress = state.phaseProgress + deltaMs / duration

  if (nextProgress < 1) {
    const patch: Partial<SwarmRuntimeState> = { phaseProgress: nextProgress }
    if (phase === "frame") patch.frameProgress = nextProgress
    if (phase === "scan") patch.scanProgress = nextProgress
    if (phase === "type") patch.typeProgress = nextProgress
    return { ...state, ...patch }
  }

  const upcoming = nextPhase(phase)
  const carried: Partial<SwarmRuntimeState> = {
    phase: upcoming,
    phaseProgress: 0,
    playing: upcoming !== "complete",
  }
  if (phase === "frame") carried.frameProgress = 1
  if (phase === "scan") carried.scanProgress = 1
  if (phase === "type") carried.typeProgress = 1
  return { ...state, ...carried }
}

/** Character index to reveal at progress 0–1 (floor, never past total). */
export function typingRevealIndex(
  progress: number,
  totalChars: number,
): number {
  if (totalChars <= 0) return 0
  const clamped = Math.min(1, Math.max(0, progress))
  return Math.min(totalChars, Math.floor(clamped * totalChars))
}

export function phaseShowsOverlay(phase: SwarmPhase, reducedMotion: boolean): boolean {
  if (reducedMotion) return false
  return phase !== "idle" && phase !== "complete"
}
