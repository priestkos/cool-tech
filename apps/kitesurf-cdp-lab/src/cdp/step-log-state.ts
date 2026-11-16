import type { TranscriptEntry } from "./types"

export type StepLogState = {
  transcriptId: string
  scrubIndex: number
  autoPlay: boolean
}

export function createStepLogState(
  transcriptId: string,
  length: number
): StepLogState {
  return {
    transcriptId,
    scrubIndex: Math.max(0, length - 1),
    autoPlay: false,
  }
}

export function serializeStepLogState(state: StepLogState): string {
  return JSON.stringify(state)
}

export function parseStepLogState(raw: string): StepLogState {
  const parsed = JSON.parse(raw) as StepLogState
  if (!parsed || typeof parsed.transcriptId !== "string") {
    throw new Error("Invalid step log state")
  }
  if (typeof parsed.scrubIndex !== "number" || typeof parsed.autoPlay !== "boolean") {
    throw new Error("Invalid step log state fields")
  }
  return parsed
}

export function stepLogRoundTrip(state: StepLogState): StepLogState {
  return parseStepLogState(serializeStepLogState(state))
}

export function setScrubIndex(
  state: StepLogState,
  index: number,
  maxIndex: number
): StepLogState {
  return {
    ...state,
    scrubIndex: Math.max(0, Math.min(index, maxIndex)),
  }
}

export function entryAtIndex(
  entries: TranscriptEntry[],
  index: number
): TranscriptEntry | undefined {
  if (index < 0 || index >= entries.length) return undefined
  return entries[index]
}