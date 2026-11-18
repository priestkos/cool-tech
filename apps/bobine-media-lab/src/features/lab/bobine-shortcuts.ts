/** Matches default hotkeys in bobinejs MediaRoot (v0.2.2). */
export const BOBINE_SHORTCUT_REFERENCE = [
  { label: "Play / pause", keys: "Space, K" },
  { label: "Seek back 10s", keys: "J" },
  { label: "Seek forward 10s", keys: "L" },
  { label: "Seek back 5s", keys: "←" },
  { label: "Seek forward 5s", keys: "→" },
  { label: "Volume up / down", keys: "↑ / ↓" },
  { label: "Mute", keys: "M" },
  { label: "Fullscreen", keys: "F" },
  { label: "Captions", keys: "C" },
  { label: "Picture in picture", keys: "I" },
  { label: "Seek to start / end", keys: "Home / End" },
  { label: "Seek to 0–90%", keys: "0–9" },
] as const