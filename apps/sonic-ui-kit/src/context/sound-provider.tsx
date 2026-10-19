import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  playSound,
  setSoundMuted,
  setSoundVolume,
} from '@/components/sounds/react-bits-sound'
import {
  SOUND_CATALOG,
  type ComponentKey,
  type SoundId,
} from '@/lib/sound-catalog'
import {
  DEFAULT_SETTINGS,
  parseSoundSettings,
  prefersReducedMotion,
  serializeSoundSettings,
  STORAGE_KEY,
  type SoundSettings,
} from '@/lib/sound-settings'

type SoundContextValue = {
  settings: SoundSettings
  reducedMotionActive: boolean
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  setReducedMotionOverride: (override: boolean | null) => void
  setComponentSound: (key: ComponentKey, soundId: SoundId) => void
  setToastSound: (kind: keyof SoundSettings['toastSounds'], soundId: SoundId) => void
  playById: (soundId: SoundId) => void
  playForComponent: (key: ComponentKey) => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

function loadInitialSettings(): SoundSettings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  return parseSoundSettings(localStorage.getItem(STORAGE_KEY))
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SoundSettings>(loadInitialSettings)
  const [reducedMotionActive, setReducedMotionActive] = useState(prefersReducedMotion())

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => {
      setReducedMotionActive(media.matches)
      if (settings.reducedMotionOverride === null) {
        setSettings(current =>
          parseSoundSettings(
            serializeSoundSettings({
              ...current,
              muted: media.matches ? true : DEFAULT_SETTINGS.muted,
              volume: media.matches
                ? Math.min(current.volume, 0.15)
                : current.volume < 0.2
                  ? DEFAULT_SETTINGS.volume
                  : current.volume,
            }),
          ),
        )
      }
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [settings.reducedMotionOverride])

  useEffect(() => {
    setSoundVolume(settings.volume)
    setSoundMuted(settings.muted)
    localStorage.setItem(STORAGE_KEY, serializeSoundSettings(settings))
  }, [settings])

  const playById = useCallback(
    (soundId: SoundId) => {
      const recipe = SOUND_CATALOG[soundId].recipe
      playSound(recipe).catch(() => undefined)
    },
    [],
  )

  const playForComponent = useCallback(
    (key: ComponentKey) => {
      playById(settings.componentSounds[key])
    },
    [playById, settings.componentSounds],
  )

  const update = useCallback((patch: Partial<SoundSettings>) => {
    setSettings(current => ({ ...current, ...patch }))
  }, [])

  const value = useMemo<SoundContextValue>(
    () => ({
      settings,
      reducedMotionActive,
      setVolume: volume => update({ volume }),
      setMuted: muted => update({ muted }),
      setReducedMotionOverride: reducedMotionOverride =>
        update({ reducedMotionOverride }),
      setComponentSound: (key, soundId) =>
        update({
          componentSounds: { ...settings.componentSounds, [key]: soundId },
        }),
      setToastSound: (kind, soundId) =>
        update({
          toastSounds: { ...settings.toastSounds, [kind]: soundId },
        }),
      playById,
      playForComponent,
    }),
    [settings, reducedMotionActive, update, playById, playForComponent],
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}

export function useSoundKit() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSoundKit must be used within SoundProvider')
  return ctx
}

/** Plays the sound mapped to a catalog id, respecting global mute/volume. */
export function useMappedSound(soundId: SoundId) {
  const { playById } = useSoundKit()
  return useCallback(() => playById(soundId), [playById, soundId])
}
