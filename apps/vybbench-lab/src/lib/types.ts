export type MetricTab = "font" | "color" | "edit"

export type ModelId =
  | "vyb-1.0"
  | "chatgpt-image"
  | "muse"
  | "recraft-v41"
  | "noise-floor"

export type ScenarioId = "font-harbor" | "color-gray" | "edit-coral"

export interface ModelMeta {
  id: ModelId
  name: string
  vendor: string
  note?: string
  fontOnly?: boolean
}

export interface ScoreColumn {
  key: string
  label: string
  format: "decimal" | "decimal1" | "integer" | "percent"
}

export interface MetricSection {
  title: string
  methodology: string
  polarity: "higher" | "lower" | "mixed"
  columns: ScoreColumn[]
  rows: Record<string, string | number | boolean | undefined>[]
}

export interface VybbenchFixture {
  run: string
  sources: string[]
  footnote?: string
  models: ModelMeta[]
  font: MetricSection
  color: MetricSection
  edit: MetricSection
  scenarios: {
    id: ScenarioId
    family: MetricTab
    label: string
    description: string
  }[]
}

export interface AppUrlState {
  tab: MetricTab
  modelId: ModelId | null
  scenarioId: ScenarioId
  diffHeat: boolean
}
