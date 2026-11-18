export type LabTheme = "light" | "dark"

export function resolveInitialTheme(): LabTheme {
  if (typeof document === "undefined") return "light"
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function applyTheme(theme: LabTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

export function toggleTheme(current: LabTheme): LabTheme {
  return current === "dark" ? "light" : "dark"
}