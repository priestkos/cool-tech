import type { ReverbLanguage } from "runntime/zoo"

export interface GenerationRecord {
  id: string
  text: string
  language: ReverbLanguage
  createdAt: number
  sampleRate: number
  samples: Float32Array
  rtf: number
  generationMs: number
  audioSeconds: number
}

export const MAX_HISTORY = 5

export function pushHistory(
  prev: GenerationRecord[],
  entry: GenerationRecord,
): GenerationRecord[] {
  return [entry, ...prev].slice(0, MAX_HISTORY)
}