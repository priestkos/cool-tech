import type { Recipe } from "@/components/sounds/react-bits-sound"
import appear from "@/components/sounds/appear"
import bitflip from "@/components/sounds/bitflip"
import boop from "@/components/sounds/boop"
import check from "@/components/sounds/check"
import chime from "@/components/sounds/chime"
import corrupt from "@/components/sounds/corrupt"
import cue from "@/components/sounds/cue"
import ding from "@/components/sounds/ding"

export type SoundId =
  | "boop"
  | "chime"
  | "check"
  | "bitflip"
  | "ding"
  | "corrupt"
  | "cue"
  | "appear"

export type ComponentSoundKey =
  | "button"
  | "switch"
  | "tabs"
  | "dialog"
  | "toast"
  | "toastSuccess"
  | "toastError"
  | "toastInfo"

export interface SoundDefinition {
  id: SoundId
  label: string
  description: string
  recipe: Recipe
}

export const SOUNDS: Record<SoundId, SoundDefinition> = {
  boop: {
    id: "boop",
    label: "Boop",
    description: "Playful rubbery pop for buttons",
    recipe: boop,
  },
  chime: {
    id: "chime",
    label: "Chime",
    description: "Soft bells for notifications",
    recipe: chime,
  },
  check: {
    id: "check",
    label: "Check",
    description: "Light wooden tock for success",
    recipe: check,
  },
  bitflip: {
    id: "bitflip",
    label: "Bitflip",
    description: "Short digital stutter for toggles",
    recipe: bitflip,
  },
  ding: {
    id: "ding",
    label: "Ding",
    description: "Clean bell for highlights",
    recipe: ding,
  },
  corrupt: {
    id: "corrupt",
    label: "Corrupt",
    description: "Crunchy digital error hit",
    recipe: corrupt,
  },
  cue: {
    id: "cue",
    label: "Cue",
    description: "Gentle three-note rise",
    recipe: cue,
  },
  appear: {
    id: "appear",
    label: "Appear",
    description: "Soft pop for reveals",
    recipe: appear,
  },
}

export const SOUND_LIST = Object.values(SOUNDS)

export const DEFAULT_COMPONENT_SOUNDS: Record<ComponentSoundKey, SoundId> = {
  button: "boop",
  switch: "bitflip",
  tabs: "ding",
  dialog: "appear",
  toast: "chime",
  toastSuccess: "check",
  toastError: "corrupt",
  toastInfo: "cue",
}

export function recipeForSound(id: SoundId): Recipe {
  return SOUNDS[id].recipe
}
