import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  playSound,
  setSoundMuted,
  setSoundVolume,
} from "@/components/sounds/react-bits-sound"
import {
  recipeForSound,
  type ComponentSoundKey,
  type SoundId,
} from "@/lib/sound-registry"
import {
  applyReducedMotionDefault,
  effectiveReducedMuted,
  loadSoundSettings,
  saveSoundSettings,
  STORAGE_KEY,
  type SoundSettings,
} from "@/lib/sound-settings"

interface SoundContextValue {
  settings: SoundSettings
  prefersReducedMotion: boolean
  showReducedBadge: boolean
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  setReducedMotionOverride: (value: boolean | null) => void
  setComponentSound: (key: ComponentSoundKey, soundId: SoundId) => void
  playComponentSound: (key: ComponentSoundKey) => void
}

const SoundContext = createContext<SoundContextValue | null>(null)

function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setPrefers(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return prefers
}

function syncEngine(settings: SoundSettings, prefersReduced: boolean) {
  const reduced = effectiveReducedMuted(prefersReduced, settings)
  const audibleMuted = settings.muted || reduced
  setSoundMuted(audibleMuted)
  const volume = reduced && !settings.muted ? settings.volume * 0.25 : settings.volume
  setSoundVolume(audibleMuted ? 0 : volume)
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [settings, setSettings] = useState<SoundSettings>(() => {
    const hasStored = localStorage.getItem(STORAGE_KEY) !== null
    const loaded = loadSoundSettings(localStorage)
    return applyReducedMotionDefault(loaded, prefersReducedMotion, hasStored)
  })

  useEffect(() => {
    syncEngine(settings, prefersReducedMotion)
    saveSoundSettings(localStorage, settings)
  }, [settings, prefersReducedMotion])

  const setVolume = useCallback((volume: number) => {
    setSettings((prev) => ({ ...prev, volume }))
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    setSettings((prev) => ({ ...prev, muted }))
  }, [])

  const setReducedMotionOverride = useCallback((value: boolean | null) => {
    setSettings((prev) => ({ ...prev, reducedMotionOverride: value }))
  }, [])

  const setComponentSound = useCallback(
    (key: ComponentSoundKey, soundId: SoundId) => {
      setSettings((prev) => ({
        ...prev,
        componentSounds: { ...prev.componentSounds, [key]: soundId },
      }))
    },
    [],
  )

  const playComponentSound = useCallback(
    (key: ComponentSoundKey) => {
      const soundId = settings.componentSounds[key]
      playSound(recipeForSound(soundId)).catch(() => undefined)
    },
    [settings.componentSounds],
  )

  const showReducedBadge =
    prefersReducedMotion &&
    settings.reducedMotionOverride !== false &&
    (settings.muted || settings.volume <= 0.25)

  const value = useMemo(
    () => ({
      settings,
      prefersReducedMotion,
      showReducedBadge,
      setVolume,
      setMuted,
      setReducedMotionOverride,
      setComponentSound,
      playComponentSound,
    }),
    [
      settings,
      prefersReducedMotion,
      showReducedBadge,
      setVolume,
      setMuted,
      setReducedMotionOverride,
      setComponentSound,
      playComponentSound,
    ],
  )

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  )
}

export function useSoundContext() {
  const ctx = useContext(SoundContext)
  if (!ctx) {
    throw new Error("useSoundContext must be used within SoundProvider")
  }
  return ctx
}

/** Play the sound mapped to a UI component slot. */
export function useAppSound(key: ComponentSoundKey) {
  const { playComponentSound } = useSoundContext()
  return useCallback(() => playComponentSound(key), [key, playComponentSound])
}
