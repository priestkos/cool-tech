import { StrictMode, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import { Theme } from "@astryxdesign/core/theme"
import { neutralTheme } from "@astryxdesign/theme-neutral/built"
import { AstryxDashboardFixture } from "@/features/astryx/AstryxDashboardFixture.tsx"
import { AstryxSettingsFixture } from "@/features/astryx/AstryxSettingsFixture.tsx"
import { DEFAULT_PREFERENCES, type ColorMode, type FixtureId, type LabPreferences } from "@/lab/types.ts"
import {
  isLabStateMessage,
  LAB_CHANNEL,
  type PreferencesPatchMessage,
} from "./protocol.ts"
import "./astryx.css"

function AstryxFrameApp() {
  const [fixture, setFixture] = useState<FixtureId>("settings")
  const [colorMode, setColorMode] = useState<ColorMode>("light")
  const [preferences, setPreferences] = useState<LabPreferences>({
    ...DEFAULT_PREFERENCES,
  })

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!isLabStateMessage(event.data)) return
      setFixture(event.data.fixture)
      setColorMode(event.data.colorMode)
      setPreferences(event.data.preferences)
    }
    window.addEventListener("message", onMessage)
    window.parent.postMessage({ channel: LAB_CHANNEL, type: "frame-ready" }, window.location.origin)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  const emitPatch = (patch: Partial<LabPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }))
    const msg: PreferencesPatchMessage = {
      channel: LAB_CHANNEL,
      type: "preferences-patch",
      patch,
    }
    window.parent.postMessage(msg, window.location.origin)
  }

  return (
    <Theme theme={neutralTheme} mode={colorMode}>
      {fixture === "settings" ? (
        <AstryxSettingsFixture preferences={preferences} onChange={emitPatch} />
      ) : (
        <AstryxDashboardFixture preferences={preferences} />
      )}
    </Theme>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AstryxFrameApp />
  </StrictMode>,
)
