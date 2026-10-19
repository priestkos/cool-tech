import {
  DEFAULT_COMPONENT_SOUNDS,
  type ComponentSoundKey,
  type SoundId,
} from "@/lib/sound-registry"

export const STORAGE_KEY = "sonic-ui-kit:sound-settings"

export interface SoundSettings {
  volume: number
  muted: boolean
  reducedMotionOverride: boolean | null
  componentSounds: Record<ComponentSoundKey, SoundId>
}

export const DEFAULT_SOUND_SETTINGS: SoundSettings = {
  volume: 0.75,
  muted: false,
  reducedMotionOverride: null,
  componentSounds: { ...DEFAULT_COMPONENT_SOUNDS },
}

const COMPONENT_KEYS = Object.keys(
  DEFAULT_COMPONENT_SOUNDS,
) as ComponentSoundKey[]

const VALID_SOUND_IDS = new Set<string>([
  "boop",
  "chime",
  "check",
  "bitflip",
  "ding",
  "corrupt",
  "cue",
  "appear",
])

function parseComponentSounds(
  raw: unknown,
): Record<ComponentSoundKey, SoundId> {
  const base = { ...DEFAULT_COMPONENT_SOUNDS }
  if (!raw || typeof raw !== "object") return base
  for (const key of COMPONENT_KEYS) {
    const value = (raw as Record<string, unknown>)[key]
    if (typeof value === "string" && VALID_SOUND_IDS.has(value)) {
      base[key] = value as SoundId
    }
  }
  return base
}

export function parseSoundSettings(raw: string | null): SoundSettings {
  if (!raw) return { ...DEFAULT_SOUND_SETTINGS }
  try {
    const data = JSON.parse(raw) as Partial<SoundSettings>
    const volume =
      typeof data.volume === "number"
        ? Math.min(1, Math.max(0, data.volume))
        : DEFAULT_SOUND_SETTINGS.volume
    const muted =
      typeof data.muted === "boolean" ? data.muted : DEFAULT_SOUND_SETTINGS.muted
    const reducedMotionOverride =
      data.reducedMotionOverride === true ||
      data.reducedMotionOverride === false
        ? data.reducedMotionOverride
        : null
    return {
      volume,
      muted,
      reducedMotionOverride,
      componentSounds: parseComponentSounds(data.componentSounds),
    }
  } catch {
    return { ...DEFAULT_SOUND_SETTINGS }
  }
}

export function loadSoundSettings(
  storage: Pick<Storage, "getItem">,
): SoundSettings {
  return parseSoundSettings(storage.getItem(STORAGE_KEY))
}

export function saveSoundSettings(
  storage: Pick<Storage, "setItem">,
  settings: SoundSettings,
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function applyReducedMotionDefault(
  settings: SoundSettings,
  prefersReduced: boolean,
  hasStored: boolean,
): SoundSettings {
  if (!prefersReduced || hasStored) return settings
  return {
    ...settings,
    muted: true,
    volume: Math.min(settings.volume, 0.2),
  }
}

export function effectiveReducedMuted(
  prefersReduced: boolean,
  settings: SoundSettings,
): boolean {
  if (settings.reducedMotionOverride === false) return false
  if (settings.reducedMotionOverride === true) return true
  return prefersReduced
}
