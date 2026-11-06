import type { AppUrlState, MetricTab, ModelId, ScenarioId } from "@/lib/types"

const TABS: MetricTab[] = ["font", "color", "edit"]
const MODELS: ModelId[] = [
  "vyb-1.0",
  "chatgpt-image",
  "muse",
  "recraft-v41",
  "noise-floor",
]
const SCENARIOS: ScenarioId[] = ["font-harbor", "color-gray", "edit-coral"]

export const DEFAULT_URL_STATE: AppUrlState = {
  tab: "font",
  modelId: null,
  scenarioId: "font-harbor",
  diffHeat: false,
}

function coerceTab(value: string | null): MetricTab {
  if (value && TABS.includes(value as MetricTab)) {
    return value as MetricTab
  }
  return DEFAULT_URL_STATE.tab
}

function coerceModel(value: string | null): ModelId | null {
  if (!value || value === "none") {
    return null
  }
  if (MODELS.includes(value as ModelId)) {
    return value as ModelId
  }
  return null
}

function coerceScenario(value: string | null): ScenarioId {
  if (value && SCENARIOS.includes(value as ScenarioId)) {
    return value as ScenarioId
  }
  return DEFAULT_URL_STATE.scenarioId
}

function coerceBool(value: string | null): boolean {
  return value === "1" || value === "true" || value === "on"
}

export function parseHash(hash: string): AppUrlState {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash
  if (!raw) {
    return { ...DEFAULT_URL_STATE }
  }
  const params = new URLSearchParams(raw)
  const tab = coerceTab(params.get("tab"))
  let scenarioId = coerceScenario(params.get("scenario"))
  const scenarioParam = params.get("scenario")
  if (!scenarioParam) {
    scenarioId =
      tab === "font"
        ? "font-harbor"
        : tab === "color"
          ? "color-gray"
          : "edit-coral"
  }
  return {
    tab,
    modelId: coerceModel(params.get("model")),
    scenarioId,
    diffHeat: coerceBool(params.get("diff")),
  }
}

export function serializeHash(state: AppUrlState): string {
  const params = new URLSearchParams()
  params.set("tab", state.tab)
  if (state.modelId) {
    params.set("model", state.modelId)
  }
  params.set("scenario", state.scenarioId)
  if (state.diffHeat) {
    params.set("diff", "1")
  }
  return `#${params.toString()}`
}

export function applyUrlState(state: AppUrlState): void {
  const next = serializeHash(state)
  if (window.location.hash !== next) {
    window.history.replaceState(null, "", next)
  }
}
