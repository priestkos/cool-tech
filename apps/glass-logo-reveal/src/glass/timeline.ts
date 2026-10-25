// Ported from glass-icon-reveal (MIT) — https://github.com/zanwei/glass-icon-reveal

import type { PresetMeta } from './presets'
import type { GlassParams } from './settings'

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const hexToRgb = (h: string): [number, number, number] => {
  const v = parseInt(h.slice(1), 16)
  return [(v >> 16 & 255) / 255, (v >> 8 & 255) / 255, (v & 255) / 255]
}
const luminance = ([r, g, b]: [number, number, number]) => 0.2126 * r + 0.7152 * g + 0.0722 * b

export function spring(t: number, response: number, damping: number): number {
  if (t <= 0) return 0
  const w = (2 * Math.PI) / response
  if (damping >= 1) return 1 - Math.exp(-w * t) * (1 + w * t)
  const wd = w * Math.sqrt(1 - damping * damping)
  return (
    1 -
    Math.exp(-damping * w * t) *
      (Math.cos(wd * t) + ((damping * w) / wd) * Math.sin(wd * t))
  )
}

const reachCache = new Map<string, number>()
function timeToReach(level: number, response: number, damping: number): number {
  const key = `${level}/${response}/${damping}`
  if (!reachCache.has(key)) {
    let lo = 0
    let hi = 3
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2
      if (spring(mid, response, damping) < level) lo = mid
      else hi = mid
    }
    reachCache.set(key, hi)
  }
  return reachCache.get(key)!
}

export interface ShaderFrame {
  uPlateScale: number
  uShapeN: number
  uCornerN: number
  uOptics: number
  uPlateAlpha: number
  uLogoHalf: number
  uLogoOff: [number, number]
  uBold: number
  uBlur: number
  uFrost: number
  uDome: number
  uDrop: number
  uPinch: number
  uTilt: number
  uRim: number
  uHalo: number
  uShadow: number
  uGhost: number
  uRipR: number
  uRipA: number
  uBare: number
  uReach: number
  uCornerPull: number
  uStreak: number
  uWiden: number
  uSlab: number
  uEtaSpread: number
  uFocus: number
  uFocusK: number
  uFocusSplit: number
  uRimLine: number
  uCornerOn: number
  uGlow: number
  uFaceDisp: number
  uVivid: number
  uDissolve: number
  uDepth: number
  uDisp: number
  uDouble: number
  uBevelW: number
  uSpec: number
  uIconPlate: number
  uUseColor: number
  uLightScene: number
  uBg: [number, number, number]
  uPlateCol: [number, number, number]
  uLogoCol: [number, number, number]
}

export function frameAt(
  T: number,
  P: GlassParams,
  preset: PresetMeta,
  outro = 0,
): ShaderFrame {
  const tx = P.present
  const damping = 1 - P.bounce
  const grow = spring(T + 0.01, P.response, damping)
  const tl = timeToReach(0.85, P.response, damping) - 0.01
  const tm = timeToReach(0.92, P.response, damping) - 0.01
  const morph = spring(T - tm, 0.3, 1)
  const drop = 1 - smooth(0.05, 1, morph)
  const appear = smooth(0, 0.06, T)
  const drift = P.drift * spring(T - 0.25, 1.5, 1)
  const zoomIn = spring(T, 0.7, 1)
  const settle = spring(T - 0.4, 1.6, 1)
  const exit = spring(T - tx, 0.8, 1)
  const release = spring(T - tx - 0.05, 0.5, 1)
  const dome = 0.15 * P.bulge * (1 - smooth(0.4, 0.95, grow))
  const view =
    (1 + (P.startZoom - 1) * (1 - zoomIn)) *
    (1 - 0.045 * settle) *
    mix(1, P.finalScale, exit) *
    (1 - 0.06 * outro)
  const off = preset.offset ?? [0, 0]
  const ls = preset.lensShift ?? [0, 0]
  const bandW = mix(P.bevelWidth, Math.max(P.bevelWidth, 0.4), drop)
  const plateScale = mix(P.startSize, 1, grow) * (1 + drift) * (1 + 0.14 * release)
  const light = luminance(hexToRgb(P.background)) > 0.5 ? 1 : 0
  return {
    uPlateScale: plateScale,
    uShapeN: mix(2, P.corner, morph),
    uCornerN: P.corner,
    uOptics: 1 - smooth(0.55, 1, release),
    uPlateAlpha: appear * (1 - smooth(0.45, 1, release)),
    uLogoHalf: P.logoScale * view,
    uLogoOff: [off[0] + ls[0] * (1 - zoomIn), off[1] + ls[1] * (1 - zoomIn)],
    uBold: P.swell * 0.03 * (1 - zoomIn),
    uBlur: P.focus * 0.05 * (1 - smooth(0.3, 0.95, grow)) + 0.03 * outro,
    uFrost: P.focus * (1 - smooth(0.5, 0.95, grow)),
    uPinch: 0.38 * P.stretch * smooth(0.1, 0.9, morph) * smooth(0.75, 0.97, zoomIn),
    uTilt: P.tilt,
    uDome: dome,
    uDrop: drop,
    uRim: 1 + 0.8 * drop,
    uHalo: P.halo * (0.5 + 0.5 * drop),
    uShadow: P.shadow * smooth(0.45, 0.8, grow) * (1 - smooth(0, 0.6, morph)),
    uGhost: smooth(0, 0.03, T) * (1 - smooth(0.04, 0.08, T)),
    uRipR: 1 + 0.9 * Math.max(0, T - tl),
    uRipA: P.ripple * smooth(tl, tl + 0.06, T) * Math.exp(-Math.max(0, T - tl) / 0.5),
    uBare: smooth(tx - 0.2, tx, T) * (1 - outro),
    uReach: bandW * plateScale,
    uCornerPull: P.cornerPull,
    uStreak: P.edgeSmear,
    uWiden: P.cornerWidth,
    uSlab: 0.3 * P.opticalDepth,
    uEtaSpread: 0.06,
    uFocus: P.cornerFocus,
    uFocusK: 1.0,
    uFocusSplit: 0.056 * P.glow,
    uRimLine: 0.09,
    uCornerOn: smooth(0.35, 1, morph),
    uGlow: 0.012 * P.glow,
    uFaceDisp: 0.012 * P.dispersion,
    uVivid: 0.85,
    uDissolve: release,
    uDepth: P.opticalDepth,
    uDisp: P.dispersion,
    uDouble: P.doubleBevel,
    uBevelW: bandW * (1 - release),
    uSpec: P.specular,
    uIconPlate: P.iconPlate ? 1 : 0,
    uUseColor: P.originalColors ? 1 : 0,
    uLightScene: light,
    uBg: hexToRgb(P.background),
    uPlateCol: hexToRgb(P.plateColor),
    uLogoCol: hexToRgb(P.logoColor),
  }
}
