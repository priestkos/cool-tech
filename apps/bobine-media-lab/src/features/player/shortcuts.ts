export type ShortcutAction =
  | "togglePlay"
  | "seekBack10"
  | "seekForward10"
  | "seekBackSmall"
  | "seekForwardSmall"
  | "volumeUp"
  | "volumeDown"
  | "toggleMute"
  | "toggleFullscreen"
  | "toggleCaptions"
  | "showHelp"

export type ShortcutEntry = {
  keys: string
  action: ShortcutAction
  label: string
}

export const SHORTCUT_REFERENCE: ShortcutEntry[] = [
  { keys: "Space / K", action: "togglePlay", label: "Play / pause" },
  { keys: "J / L", action: "seekBack10", label: "Seek −10s / +10s" },
  { keys: "← / →", action: "seekBackSmall", label: "Seek back / forward" },
  { keys: "↑ / ↓", action: "volumeUp", label: "Volume up / down" },
  { keys: "M", action: "toggleMute", label: "Mute" },
  { keys: "F", action: "toggleFullscreen", label: "Fullscreen" },
  { keys: "C", action: "toggleCaptions", label: "Captions" },
  { keys: "?", action: "showHelp", label: "Shortcut overlay" },
]

export function mapKeyToAction(
  key: string,
  code: string,
  opts: { typingInField?: boolean }
): ShortcutAction | null {
  if (opts.typingInField) return null

  const normalized = key.length === 1 ? key.toUpperCase() : key

  if (normalized === " " || normalized === "Spacebar" || key === " " || code === "Space") {
    return "togglePlay"
  }
  if (normalized === "K") return "togglePlay"
  if (normalized === "J") return "seekBack10"
  if (normalized === "L") return "seekForward10"
  if (key === "ArrowLeft") return "seekBackSmall"
  if (key === "ArrowRight") return "seekForwardSmall"
  if (key === "ArrowUp") return "volumeUp"
  if (key === "ArrowDown") return "volumeDown"
  if (normalized === "M") return "toggleMute"
  if (normalized === "F") return "toggleFullscreen"
  if (normalized === "C") return "toggleCaptions"
  if (key === "?" || (key === "/" && code === "Slash")) return "showHelp"

  return null
}

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const
export type PlaybackRate = (typeof PLAYBACK_RATES)[number]

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}