import { NAMED_EASINGS } from "../lib/bezier"
import { deepCloneSpec } from "../lib/keyframes"
import type { AnimationSpec, ReferencePreset } from "../lib/types"

function cardEntranceReference(): AnimationSpec {
  return {
    delayMs: 120,
    durationMs: 720,
    easing: { kind: "named", name: "ease-out-expo", points: NAMED_EASINGS["ease-out-expo"] },
    keyframes: [
      { offset: 0, translateY: 28, opacity: 0, scale: 0.92 },
      { offset: 1, translateY: 0, opacity: 1, scale: 1 },
    ],
  }
}

function toastSlideReference(): AnimationSpec {
  return {
    delayMs: 0,
    durationMs: 520,
    easing: { kind: "named", name: "ease-out", points: NAMED_EASINGS["ease-out"] },
    keyframes: [
      { offset: 0, translateY: 48, opacity: 0, scale: 1 },
      { offset: 1, translateY: 0, opacity: 1, scale: 1 },
    ],
  }
}

function badgePopReference(): AnimationSpec {
  return {
    delayMs: 80,
    durationMs: 640,
    easing: { kind: "named", name: "ease-out-back", points: NAMED_EASINGS["ease-out-back"] },
    keyframes: [
      { offset: 0, translateY: 0, opacity: 0, scale: 0.4 },
      { offset: 0.72, translateY: 0, opacity: 1, scale: 1.12 },
      { offset: 1, translateY: 0, opacity: 1, scale: 1 },
    ],
  }
}

function mismatchedCopy(ref: AnimationSpec): AnimationSpec {
  const copy = deepCloneSpec(ref)
  copy.delayMs += 140
  copy.durationMs -= 160
  copy.easing = { kind: "named", name: "ease-in", points: NAMED_EASINGS["ease-in"] }
  copy.keyframes = copy.keyframes.map((k) => ({
    ...k,
    translateY: k.translateY + 8,
    opacity: Math.max(0, k.opacity - 0.15),
    scale: k.scale * 0.96,
  }))
  return copy
}

export const REFERENCE_PRESETS: ReferencePreset[] = [
  {
    id: "card-entrance",
    label: "Card entrance",
    description: "Fade up with slight scale settle.",
    reference: cardEntranceReference(),
    initialCopy: mismatchedCopy(cardEntranceReference()),
  },
  {
    id: "toast-slide",
    label: "Toast slide",
    description: "Slide down into place with opacity.",
    reference: toastSlideReference(),
    initialCopy: mismatchedCopy(toastSlideReference()),
  },
  {
    id: "badge-pop",
    label: "Badge pop",
    description: "Scale overshoot then settle (keyframes, not a spring solver).",
    reference: badgePopReference(),
    initialCopy: mismatchedCopy(badgePopReference()),
  },
]

export function getPreset(id: string): ReferencePreset {
  return REFERENCE_PRESETS.find((p) => p.id === id) ?? REFERENCE_PRESETS[0]
}

export function totalAnimationMs(spec: AnimationSpec): number {
  return spec.delayMs + spec.durationMs + 400
}
