export type ThinkingState = "thinking" | "searching" | "tool" | "writing" | "idle"

export type SandSliderEl = HTMLElement & {
  value: number
  min: number
  max: number
  step: number
}

export type SandToggleEl = HTMLElement & {
  checked: boolean
}

export type SandSignatureEl = HTMLElement & {
  readonly empty: boolean
  undo(): void
  clear(): void
  toDataURL(ink?: string, scale?: number): string
}

export type SandThinkingEl = HTMLElement & {
  state: ThinkingState
  thinking: boolean
}

export type TrayWidthPreset = "compact" | "roomy"

export const TRAY_WIDTH_PX: Record<TrayWidthPreset, number> = {
  compact: 300,
  roomy: 380,
}