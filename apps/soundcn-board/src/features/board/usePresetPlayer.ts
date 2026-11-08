import { useSound } from "@/hooks/use-sound"
import { PRESET_CATALOG, type PresetId } from "@/lib/soundcn/presets"

export function usePresetPlayer(
  presetId: PresetId,
  soundEnabled: boolean,
  volume: number,
  onPlay?: () => void,
) {
  const asset = PRESET_CATALOG[presetId]
  const [play, controls] = useSound(asset, {
    soundEnabled,
    volume,
    interrupt: true,
    onPlay,
  })
  return { play, ...controls, presetId, asset }
}
