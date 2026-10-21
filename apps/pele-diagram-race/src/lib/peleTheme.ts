import type { CSSProperties } from "react"

export type PeleTheme = {
  bg: string
  fg: string
  muted: string
  line: string
  surface: string
  surfaceAlt: string
  border: string
  accent: string
  radius: number
  series: string[]
}

export const DEFAULT_PELE_THEME: PeleTheme = {
  bg: "#fffcf0",
  fg: "#100f0f",
  muted: "#6f6e69",
  line: "#100f0f",
  surface: "#f2f0e5",
  surfaceAlt: "#e6e4d9",
  border: "#cecdc3",
  accent: "#205ea6",
  radius: 4,
  series: [
    "#205ea6",
    "#bc5215",
    "#ad8301",
    "#638c06",
    "#8b7ec8",
    "#ba7517",
    "#d14d41",
    "#879a39",
  ],
}

export function peleThemeToStyle(theme: PeleTheme): CSSProperties {
  const style: Record<string, string> = {
    "--pele-bg": theme.bg,
    "--pele-fg": theme.fg,
    "--pele-muted": theme.muted,
    "--pele-line": theme.line,
    "--pele-surface": theme.surface,
    "--pele-surface-alt": theme.surfaceAlt,
    "--pele-border": theme.border,
    "--pele-accent": theme.accent,
    "--pele-radius": `${theme.radius}px`,
  }
  theme.series.forEach((color, index) => {
    style[`--pele-series-${index + 1}`] = color
  })
  return style as CSSProperties
}
