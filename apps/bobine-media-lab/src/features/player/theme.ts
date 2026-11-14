export type LabTheme = "light" | "dark"

const STORAGE_KEY = "bobine-media-lab-theme"

export function resolveInitialTheme(): LabTheme {
  if (typeof window === "undefined") return "light"
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === "light" || stored === "dark") return stored
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function applyTheme(theme: LabTheme, root: HTMLElement = document.documentElement) {
  root.classList.toggle("dark", theme === "dark")
  root.dataset.theme = theme
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, theme)
  }
}

export function toggleTheme(current: LabTheme): LabTheme {
  return current === "light" ? "dark" : "light"
}