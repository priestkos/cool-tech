import { easingToCss } from "./bezier"
import type { AnimationSpec, MotionProperty, TimeValue } from "./types"

export function waapiKeyframes(spec: AnimationSpec): Keyframe[] {
  return spec.keyframes.map((k) => ({
    offset: k.offset,
    transform: `translateY(${k.translateY}px) scale(${k.scale})`,
    opacity: k.opacity,
  }))
}

export function readElementSample(el: HTMLElement): {
  translateY: number
  opacity: number
  scale: number
} {
  const opacity = Number.parseFloat(getComputedStyle(el).opacity)
  const transform = getComputedStyle(el).transform
  if (transform === "none") {
    return { translateY: 0, opacity, scale: 1 }
  }
  const matrix = new DOMMatrix(transform)
  const scale = Math.hypot(matrix.a, matrix.b)
  return { translateY: matrix.f, opacity, scale: scale || 1 }
}

export function sampleElementAnimation(
  el: HTMLElement,
  spec: AnimationSpec,
  fps: number,
  totalMs: number,
): Record<MotionProperty, TimeValue[]> {
  const anim = el.animate(waapiKeyframes(spec), {
    duration: spec.durationMs,
    delay: spec.delayMs,
    fill: "both",
    easing: easingToCss(spec.easing),
  })
  anim.pause()

  const step = 1000 / fps
  const tracks: Record<MotionProperty, TimeValue[]> = {
    translateY: [],
    opacity: [],
    scale: [],
  }

  for (let t = 0; t <= totalMs + 0.001; t += step) {
    anim.currentTime = t
    const sample = readElementSample(el)
    const timeMs = Math.round(t * 1000) / 1000
    tracks.translateY.push({ timeMs, value: sample.translateY })
    tracks.opacity.push({ timeMs, value: sample.opacity })
    tracks.scale.push({ timeMs, value: sample.scale })
  }

  anim.cancel()
  return tracks
}
