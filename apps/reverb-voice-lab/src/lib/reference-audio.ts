import {
  REFERENCE_MAX_SECONDS,
  REFERENCE_MIN_SECONDS,
  REVERB_SAMPLE_RATE,
} from "@/lib/reverb-config"

export function samplesDurationSeconds(
  samples: Float32Array,
  sampleRate: number,
): number {
  return samples.length / sampleRate
}

export function validateReferenceDuration(
  samples: Float32Array,
  sampleRate: number,
): { ok: true } | { ok: false; message: string } {
  const seconds = samplesDurationSeconds(samples, sampleRate)
  if (seconds < REFERENCE_MIN_SECONDS) {
    return {
      ok: false,
      message: `Clip is ${seconds.toFixed(1)} s — need ${REFERENCE_MIN_SECONDS}–${REFERENCE_MAX_SECONDS} s.`,
    }
  }
  if (seconds > REFERENCE_MAX_SECONDS) {
    return {
      ok: false,
      message: `Clip is ${seconds.toFixed(1)} s — trim to at most ${REFERENCE_MAX_SECONDS} s.`,
    }
  }
  return { ok: true }
}

/** Trim or pad is not applied; callers upload/record within bounds. */
export function trimToMaxReference(
  samples: Float32Array,
  sampleRate: number,
): Float32Array {
  const maxSamples = Math.floor(REFERENCE_MAX_SECONDS * sampleRate)
  if (samples.length <= maxSamples) return samples
  return samples.slice(0, maxSamples)
}

import { decodeAudio } from "runntime/zoo"

export async function decodeToReverbRate(data: ArrayBuffer): Promise<Float32Array> {
  return decodeAudio(data, REVERB_SAMPLE_RATE)
}