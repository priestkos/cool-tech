// Ported from glass-icon-reveal (MIT) — https://github.com/zanwei/glass-icon-reveal

import type { PresetId } from './presets'
import { PRESETS } from './presets'
import { frameAt } from './timeline'

export type LookId = 'light' | 'dark'

/** Full shader parameter set (upstream `P`). */
export interface GlassParams {
  presetId: PresetId
  originalColors: boolean
  tileSize: number
  logoScale: number
  finalScale: number
  iconPlate: boolean
  opticalDepth: number
  dispersion: number
  glow: number
  doubleBevel: number
  bevelWidth: number
  corner: number
  cornerPull: number
  cornerWidth: number
  cornerFocus: number
  edgeSmear: number
  stretch: number
  tilt: number
  bulge: number
  specular: number
  halo: number
  shadow: number
  ripple: number
  bounce: number
  response: number
  startSize: number
  startZoom: number
  present: number
  drift: number
  swell: number
  focus: number
  hold: number
  background: string
  plateColor: string
  logoColor: string
}

/** Studio-facing controls exposed in the UI. */
export interface StudioSettings {
  look: LookId
  presetId: PresetId
  originalColors: boolean
  opticalDepth: number
  edgeSmear: number
  specular: number
  response: number
  present: number
}

const BASE: Omit<GlassParams, 'presetId'> = {
  originalColors: false,
  tileSize: 256,
  logoScale: 0.7,
  finalScale: 0.69,
  iconPlate: false,
  opticalDepth: 1.1,
  dispersion: 1.7,
  glow: 1.25,
  doubleBevel: 1,
  bevelWidth: 0.14,
  corner: 4.8,
  cornerPull: 2.1,
  cornerWidth: 2.2,
  cornerFocus: 0.58,
  edgeSmear: 2.85,
  stretch: 0,
  tilt: 0.35,
  bulge: 1,
  specular: 1,
  halo: 0,
  shadow: 1,
  ripple: 1,
  bounce: 0,
  response: 0.34,
  startSize: 0.2,
  startZoom: 2.6,
  present: 1,
  drift: 0.12,
  swell: 0.5,
  focus: 1,
  hold: 0.8,
  background: '#e9e9eb',
  plateColor: '#ffffff',
  logoColor: '#0e1428',
}

const LOOKS: Record<LookId, Partial<GlassParams> & { presetId: PresetId }> = {
  light: { presetId: 'diamond', ...BASE },
  dark: {
    presetId: 'ring',
    ...BASE,
    logoScale: 0.72,
    finalScale: 1,
    iconPlate: true,
    halo: 1,
    shadow: 0,
    ripple: 0.5,
    startZoom: 1.6,
    drift: 0.05,
    opticalDepth: 0.75,
    bevelWidth: 0.22,
    dispersion: 0.9,
    glow: 0.45,
    corner: 5,
    cornerPull: 1.4,
    edgeSmear: 1.2,
    tilt: 0,
    cornerWidth: 1.2,
    cornerFocus: 0.4,
    background: '#000000',
    plateColor: '#05070b',
    logoColor: '#ffffff',
  },
}

export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  look: 'light',
  presetId: 'diamond',
  originalColors: false,
  opticalDepth: BASE.opticalDepth,
  edgeSmear: BASE.edgeSmear,
  specular: BASE.specular,
  response: BASE.response,
  present: BASE.present,
}

export function studioSettingsFromJson(json: string): StudioSettings {
  const parsed = JSON.parse(json) as Partial<StudioSettings>
  return { ...DEFAULT_STUDIO_SETTINGS, ...parsed }
}

export function studioSettingsToJson(settings: StudioSettings): string {
  return JSON.stringify(settings, null, 2)
}

export function glassParamsFromStudio(settings: StudioSettings): GlassParams {
  const lookBase = LOOKS[settings.look]
  const preset = PRESETS[settings.presetId]
  const useColor = settings.originalColors || preset.color
  return {
    ...BASE,
    ...lookBase,
    presetId: settings.presetId,
    originalColors: useColor,
    opticalDepth: settings.opticalDepth,
    edgeSmear: settings.edgeSmear,
    specular: settings.specular,
    response: settings.response,
    present: settings.present,
  }
}

/** Maps studio edge smear to the shader uniform used in the rim band. */
export function edgeSmearToUniform(edgeSmear: number, params: GlassParams) {
  const frame = frameAt(0.8, { ...params, edgeSmear }, PRESETS[params.presetId])
  return frame.uStreak
}
