export const EXTRACTION_STAGES = [
  "capture",
  "segment",
  "cluster",
  "name",
  "verify",
] as const

export type ExtractionStage = (typeof EXTRACTION_STAGES)[number]
export type ExtractionPhase = "idle" | "running" | "done" | "cancelled"

export type ExtractionState = {
  phase: ExtractionPhase
  stageIndex: number
  runId: number
}

export function initialExtractionState(): ExtractionState {
  return { phase: "idle", stageIndex: -1, runId: 0 }
}

export function startExtraction(state: ExtractionState): ExtractionState {
  return {
    phase: "running",
    stageIndex: 0,
    runId: state.runId + 1,
  }
}

export function advanceExtraction(state: ExtractionState): ExtractionState {
  if (state.phase !== "running") {
    return state
  }
  const next = state.stageIndex + 1
  if (next >= EXTRACTION_STAGES.length) {
    return { ...state, phase: "done", stageIndex: EXTRACTION_STAGES.length - 1 }
  }
  return { ...state, stageIndex: next }
}

export function cancelExtraction(state: ExtractionState): ExtractionState {
  if (state.phase !== "running") {
    return state
  }
  return { ...state, phase: "cancelled", stageIndex: -1 }
}

export function resetExtraction(state: ExtractionState): ExtractionState {
  return { phase: "idle", stageIndex: -1, runId: state.runId }
}

export function stageLabel(index: number): ExtractionStage | null {
  if (index < 0 || index >= EXTRACTION_STAGES.length) {
    return null
  }
  return EXTRACTION_STAGES[index] ?? null
}
