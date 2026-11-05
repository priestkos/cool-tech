import { useCallback, useEffect, useMemo, useState } from "react"
import { clampConfig, type PlaygroundConfig } from "@/lib/config"
import { configFromSearch, searchFromConfig } from "@/lib/url-state"

export function usePlaygroundConfig() {
  const [config, setConfigState] = useState<PlaygroundConfig>(() =>
    configFromSearch(window.location.search),
  )

  const setConfig = useCallback((next: PlaygroundConfig | ((prev: PlaygroundConfig) => PlaygroundConfig)) => {
    setConfigState((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next
      return clampConfig(resolved)
    })
  }, [])

  useEffect(() => {
    const search = searchFromConfig(config)
    const url = `${window.location.pathname}${search}`
    if (`${window.location.pathname}${window.location.search}` !== url) {
      window.history.replaceState(null, "", url)
    }
  }, [config])

  useEffect(() => {
    function onPopState() {
      setConfigState(configFromSearch(window.location.search))
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [])

  const shareUrl = useMemo(
    () => `${window.location.origin}${window.location.pathname}${searchFromConfig(config)}`,
    [config],
  )

  return { config, setConfig, shareUrl }
}
