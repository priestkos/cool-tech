import {
  DEFAULT_COMPONENT_SOUNDS,
  DEFAULT_TOAST_SOUNDS,
  type ComponentKey,
  type SoundId,
} from '@/lib/sound-catalog'

export const STORAGE_KEY = 'sonic-ui-kit:sound-settings-v1'

export type SoundSettings = {
  volume: number
  muted: boolean
  reducedMotionOverride: boolean | null
  componentSounds: Record<ComponentKey, SoundId>
  toastSounds: typeof DEFAULT_TOAST_SOUNDS
}

export const DEFAULT_SETTINGS: SoundSettings = {
  volume: 0.75,
  muted: false,
  reducedMotionOverride: null,
  componentSounds: { ...DEFAULT_COMPONENT_SOUNDS },
  toastSounds: { ...DEFAULT_TOAST_SOUNDS },
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function applyReducedMotionDefaults(settings: SoundSettings): SoundSettings {
  if (settings.reducedMotionOverride !== null) return settings
  if (!prefersReducedMotion()) return settings
  return {
    ...settings,
    muted: true,
    volume: Math.min(settings.volume, 0.15),
  }
}

export function parseSoundSettings(raw: string | null): SoundSettings {
  if (!raw) return applyReducedMotionDefaults({ ...DEFAULT_SETTINGS })
  try {
    const parsed = JSON.parse(raw) as Partial<SoundSettings>
    const merged: SoundSettings = {
      ...DEFAULT_SETTINGS,
      ...parsed,
      componentSounds: {
        ...DEFAULT_SETTINGS.componentSounds,
        ...parsed.componentSounds,
      },
      toastSounds: {
        ...DEFAULT_SETTINGS.toastSounds,
        ...parsed.toastSounds,
      },
    }
    merged.volume = clamp(merged.volume, 0, 1)
    return applyReducedMotionDefaults(merged)
  } catch {
    return applyReducedMotionDefaults({ ...DEFAULT_SETTINGS })
  }
}

export function serializeSoundSettings(settings: SoundSettings): string {
  return JSON.stringify(settings)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
