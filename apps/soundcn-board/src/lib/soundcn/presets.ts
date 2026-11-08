import { clickSoftSound } from "@/lib/soundcn/sounds/click-soft/click-soft"
import { confirmation001Sound } from "@/lib/soundcn/sounds/confirmation-001/confirmation-001"
import { notificationPopSound } from "@/lib/soundcn/sounds/notification-pop/notification-pop"
import { switchOffSound } from "@/lib/soundcn/sounds/switch-off/switch-off"
import { switchOnSound } from "@/lib/soundcn/sounds/switch-on/switch-on"
import type { SoundAsset } from "@/lib/soundcn/sound-types"

export type PresetId =
  | "click-soft"
  | "switch-on"
  | "switch-off"
  | "notification-pop"
  | "confirmation-001"

export const PRESET_CATALOG: Record<PresetId, SoundAsset> = {
  "click-soft": clickSoftSound,
  "switch-on": switchOnSound,
  "switch-off": switchOffSound,
  "notification-pop": notificationPopSound,
  "confirmation-001": confirmation001Sound,
}

export const PRESET_IDS = Object.keys(PRESET_CATALOG) as PresetId[]

export type BoardSlot = "primary-button" | "toggle" | "notification"

export const DEFAULT_SLOT_PRESETS: Record<BoardSlot, PresetId> = {
  "primary-button": "click-soft",
  toggle: "switch-on",
  notification: "notification-pop",
}

export const SWITCH_OFF_PRESET: PresetId = "switch-off"
