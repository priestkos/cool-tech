export type FixtureId = "settings" | "dashboard"

export type ColorMode = "light" | "dark"

export type Density = "compact" | "comfortable"

export interface LabPreferences {
  notifications: boolean
  displayName: string
  density: Density
}

export const DEFAULT_PREFERENCES: LabPreferences = {
  notifications: true,
  displayName: "Sai",
  density: "comfortable",
}
