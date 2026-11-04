export type ViewMode = "side" | "flip"
export type ScreenId = "settings" | "dashboard" | "gallery"
export type ThemeMode = "light" | "dark"
export type FlipKit = "plain" | "sketch"

export type AppState = {
  view: ViewMode
  screen: ScreenId
  theme: ThemeMode
  flipKit: FlipKit
}

const DEFAULT_STATE: AppState = {
  view: "side",
  screen: "settings",
  theme: "light",
  flipKit: "plain",
}

export function parseAppState(search: string): AppState {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)

  const view = params.get("view") === "flip" ? "flip" : "side"
  const screenParam = params.get("screen")
  const screen: ScreenId =
    screenParam === "dashboard" || screenParam === "gallery"
      ? screenParam
      : "settings"
  const theme = params.get("theme") === "dark" ? "dark" : "light"
  const flipKit = params.get("kit") === "sketch" ? "sketch" : "plain"

  return { view, screen, theme, flipKit }
}

export function serializeAppState(state: AppState): string {
  const params = new URLSearchParams()
  if (state.view !== DEFAULT_STATE.view) params.set("view", state.view)
  if (state.screen !== DEFAULT_STATE.screen) params.set("screen", state.screen)
  if (state.theme !== DEFAULT_STATE.theme) params.set("theme", state.theme)
  if (state.flipKit !== DEFAULT_STATE.flipKit) params.set("kit", state.flipKit)
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export function iframeQuery(state: AppState, omitView = true): string {
  const params = new URLSearchParams()
  params.set("screen", state.screen)
  params.set("theme", state.theme)
  if (!omitView && state.view === "flip") {
    params.set("kit", state.flipKit)
  }
  return `?${params.toString()}`
}

export function defaultAppState(): AppState {
  return { ...DEFAULT_STATE }
}

export function toggleSketchMode(state: AppState): AppState {
  if (state.view !== "flip") {
    return { ...state, view: "flip", flipKit: "sketch" }
  }
  return {
    ...state,
    flipKit: state.flipKit === "plain" ? "sketch" : "plain",
  }
}
