import { useEffect, useMemo } from "react"

import { parseAppState } from "@/lib/app-state"
import { DashboardScreen } from "@/screens/dashboard-screen"
import { GalleryScreen } from "@/screens/gallery-screen"
import { SettingsScreen } from "@/screens/settings-screen"
import type { UiKit } from "@/kits/plain-kit"

type KitPageProps = {
  kit: UiKit
  kitLabel: string
}

export function KitPage({ kit, kitLabel }: KitPageProps) {
  const state = useMemo(
    () => parseAppState(window.location.search),
    [window.location.search],
  )

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", state.theme === "dark")
  }, [state.theme])

  const { Toaster } = kit

  let body
  switch (state.screen) {
    case "dashboard":
      body = <DashboardScreen kit={kit} />
      break
    case "gallery":
      body = <GalleryScreen kit={kit} kitLabel={kitLabel} />
      break
    case "settings":
      body = <SettingsScreen kit={kit} />
      break
    default: {
      const _exhaustive: never = state.screen
      return _exhaustive
    }
  }

  return (
    <>
      {body}
      <Toaster />
    </>
  )
}
