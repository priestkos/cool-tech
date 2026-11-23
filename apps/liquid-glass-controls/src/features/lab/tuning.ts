import type { GlassOptics } from "../../components/liquid-glass"
import { PRESS } from "../../components/liquid-glass/controls/glass/physics"

/** Lab knobs (0–100) mapped to real kit fields. */
export type LabTuning = {
  refraction: number
  blur: number
  spring: number
}

export const DEFAULT_TUNING: LabTuning = {
  refraction: 50,
  blur: 40,
  spring: 50,
}

export function labToCardBlur(blurKnob: number): number {
  return Math.max(0, (blurKnob / 100) * 20)
}

export function labToCardOptics(refractionKnob: number): GlassOptics {
  const scale = 0.35 + (refractionKnob / 100) * 2.65
  const frostedRadius = (refractionKnob / 100) * 40
  return {
    refraction: scale,
    clearBlur: 0.15 + (refractionKnob / 100) * 4.5,
    clearBlurEdge: 0.5 + (refractionKnob / 100) * 5,
    frostMix: Math.min(1, frostedRadius / 20),
    frostEdge: 0.5 + (refractionKnob / 100) * 2,
  }
}

export function labToLayerOptics(refractionKnob: number, _blurKnob: number): GlassOptics {
  return { ...labToCardOptics(refractionKnob), refraction: 0.4 + (refractionKnob / 100) * 2.2 }
}

export function labToLayerBlur(blurKnob: number): number {
  return labToCardBlur(blurKnob)
}

export function labToSliderRefraction(refractionKnob: number): number {
  return 10 + (refractionKnob / 100) * 70
}

export function labToSwitchRefraction(refractionKnob: number): number {
  return 8 + (refractionKnob / 100) * 48
}

export function labToPressSpring(springKnob: number): { pressSpeed: number; pressBounce: number } {
  const t = springKnob / 100
  const pressSpeed = 8 + t * 28
  const pressBounce = Math.max(0.05, Math.min(0.95, 1 - PRESS.zeta + (t - 0.5) * 0.6))
  return { pressSpeed, pressBounce }
}

export function labToKnobBounce(springKnob: number): number {
  return 0.1 + (springKnob / 100) * 0.65
}