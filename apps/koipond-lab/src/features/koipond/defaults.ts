import { LOOKS, type KoiPondProps } from "@hxlfed/koipond"

export const LOOK_ORDER = [
  "natural",
  "ink",
  "garden",
  "lagoon",
  "violet",
  "ember",
  "mono",
] as const satisfies readonly (keyof typeof LOOKS)[]

export type PondLook = (typeof LOOK_ORDER)[number]

export type WaterOverride = NonNullable<KoiPondProps["water"]>

export interface PondLabState {
  look: PondLook
  fish: number
  fishSize: number
  pads: number
  petals: number
  minnows: number
  rain: number
  border: boolean
  cursor: boolean
  scrollCurrent: boolean
  interactive: boolean
  seed: number
  scale: number
  waterOverrideEnabled: boolean
  water: WaterOverride
}

export const POND_DEFAULTS: PondLabState = {
  look: "natural",
  fish: 12,
  fishSize: 0.18,
  pads: 4,
  petals: 10,
  minnows: 4,
  rain: 0.4,
  border: true,
  cursor: true,
  scrollCurrent: true,
  interactive: true,
  seed: 7,
  scale: 1,
  waterOverrideEnabled: false,
  water: {
    caustics: 1,
    waves: 1,
    clarity: 1,
  },
}

export function mergeWater(current: WaterOverride, patch: Partial<WaterOverride>): WaterOverride {
  return { ...current, ...patch }
}

export function toKoiPondProps(state: PondLabState): KoiPondProps {
  return {
    look: state.look,
    fish: state.fish,
    fishSize: state.fishSize,
    pads: state.pads,
    petals: state.petals,
    minnows: state.minnows,
    rain: state.rain,
    border: state.border,
    cursor: state.cursor,
    scrollCurrent: state.scrollCurrent,
    interactive: state.interactive,
    seed: state.seed,
    scale: state.scale,
    water: state.waterOverrideEnabled ? state.water : undefined,
  }
}