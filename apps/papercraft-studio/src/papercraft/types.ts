export type PapercraftMode = "3d" | "2d"

export interface PapercraftApi {
  ready?: boolean
  step: (sec: number, fps?: number) => number
  restart: () => void
  resume: () => void
  toggle: () => void
  setOpen?: (open: boolean) => void
  sound?: { setMuted: (m: boolean) => void; unlock: () => void }
  post?: { o: { maxBlur: number; haze?: string; [key: string]: unknown } }
}

export function buildTemplateUrl(
  mode: PapercraftMode,
  palette: string,
  tilt2d: boolean,
): string {
  const params = new URLSearchParams({ palette })
  const mood =
    palette === "dusk-violet"
      ? "dusk"
      : palette === "lantern-night"
        ? "night"
        : palette === "golden-hour"
          ? "golden"
          : null
  if (mood) params.set("mood", mood)
  if (mode === "2d") params.set("tilt", tilt2d ? "9" : "0")
  const base = mode === "3d" ? "/view-3d.html" : "/view-2d.html"
  return `${base}?${params.toString()}`
}