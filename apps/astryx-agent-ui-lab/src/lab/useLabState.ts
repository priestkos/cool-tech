import { useCallback, useState } from "react"
import {
  DEFAULT_PREFERENCES,
  type ColorMode,
  type FixtureId,
  type LabPreferences,
} from "./types.ts"

export function useLabState() {
  const [fixture, setFixture] = useState<FixtureId>("settings")
  const [colorMode, setColorMode] = useState<ColorMode>("light")
  const [preferences, setPreferences] = useState<LabPreferences>({
    ...DEFAULT_PREFERENCES,
  })

  const patchPreferences = useCallback((patch: Partial<LabPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }))
  }, [])

  const reset = useCallback(() => {
    setPreferences({ ...DEFAULT_PREFERENCES })
    setColorMode("light")
    setFixture("settings")
  }, [])

  return {
    fixture,
    setFixture,
    colorMode,
    setColorMode,
    preferences,
    patchPreferences,
    reset,
  }
}

export type LabState = ReturnType<typeof useLabState>
