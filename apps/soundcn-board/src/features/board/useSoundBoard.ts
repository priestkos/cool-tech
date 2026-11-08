import { useCallback, useMemo, useState } from "react"
import { getAudioContext } from "@/lib/soundcn/sound-engine"
import {
  DEFAULT_SLOT_PRESETS,
  SWITCH_OFF_PRESET,
  type BoardSlot,
  type PresetId,
} from "@/lib/soundcn/presets"
import {
  appendLog,
  canEmitSound,
  clampVolume,
  type LogEntry,
} from "./board-model"

export function useSoundBoard() {
  const [unlocked, setUnlocked] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.85)
  const [slotPresets, setSlotPresets] = useState({ ...DEFAULT_SLOT_PRESETS })
  const [toggleOn, setToggleOn] = useState(false)
  const [lastPlayed, setLastPlayed] = useState<PresetId | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])

  const soundEnabled = useMemo(
    () => canEmitSound(unlocked, muted),
    [unlocked, muted],
  )
  const effectiveVolume = clampVolume(volume)

  const pushLog = useCallback((message: string) => {
    setLog((prev) => appendLog(prev, message))
  }, [])

  const markPlayed = useCallback(
    (presetId: PresetId, label: string) => {
      setLastPlayed(presetId)
      pushLog(`Played ${label} (${presetId})`)
    },
    [pushLog],
  )

  const unlockSound = useCallback(() => {
    const ctx = getAudioContext()
    void ctx.resume().then(() => {
      setUnlocked(true)
      pushLog("Audio unlocked via Enable sound")
    })
  }, [pushLog])

  const setSlotPreset = useCallback((slot: BoardSlot, presetId: PresetId) => {
    setSlotPresets((prev) => ({ ...prev, [slot]: presetId }))
    pushLog(`Preset for ${slot} → ${presetId} (silent)`)
  }, [pushLog])

  const resetBoard = useCallback(() => {
    setSlotPresets({ ...DEFAULT_SLOT_PRESETS })
    setToggleOn(false)
    setLastPlayed(null)
    setLog(appendLog([], "Board reset"))
  }, [])

  const setMasterMuted = useCallback(
    (next: boolean) => {
      setMuted(next)
      pushLog(next ? "Master mute on" : "Master mute off")
    },
    [pushLog],
  )

  return {
    unlocked,
    muted,
    volume,
    setVolume,
    effectiveVolume,
    soundEnabled,
    slotPresets,
    toggleOn,
    setToggleOn,
    lastPlayed,
    log,
    unlockSound,
    setSlotPreset,
    resetBoard,
    setMasterMuted,
    markPlayed,
    switchOffPreset: SWITCH_OFF_PRESET,
  }
}
