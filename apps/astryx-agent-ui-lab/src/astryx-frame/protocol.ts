import type { ColorMode, FixtureId, LabPreferences } from "@/lab/types.ts"

export const LAB_CHANNEL = "astryx-agent-ui-lab"

export type LabStateMessage = {
  channel: typeof LAB_CHANNEL
  type: "lab-state"
  fixture: FixtureId
  colorMode: ColorMode
  preferences: LabPreferences
}

export type PreferencesPatchMessage = {
  channel: typeof LAB_CHANNEL
  type: "preferences-patch"
  patch: Partial<LabPreferences>
}

export function isLabStateMessage(data: unknown): data is LabStateMessage {
  if (!data || typeof data !== "object") return false
  const m = data as LabStateMessage
  return (
    m.channel === LAB_CHANNEL &&
    m.type === "lab-state" &&
    (m.fixture === "settings" || m.fixture === "dashboard") &&
    (m.colorMode === "light" || m.colorMode === "dark")
  )
}

export function isPreferencesPatchMessage(
  data: unknown,
): data is PreferencesPatchMessage {
  if (!data || typeof data !== "object") return false
  const m = data as PreferencesPatchMessage
  return m.channel === LAB_CHANNEL && m.type === "preferences-patch"
}
