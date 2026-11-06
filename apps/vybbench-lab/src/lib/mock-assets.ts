import type { ModelId, ScenarioId } from "@/lib/types"

import beforeFont from "@/assets/mocks/font-harbor/before.svg"
import afterFontChatgpt from "@/assets/mocks/font-harbor/chatgpt-image.svg"
import afterFontMuse from "@/assets/mocks/font-harbor/muse.svg"
import afterFontRecraft from "@/assets/mocks/font-harbor/recraft-v41.svg"
import afterFontVyb from "@/assets/mocks/font-harbor/vyb-1.0.svg"

import beforeColor from "@/assets/mocks/color-gray/before.svg"
import afterColorChatgpt from "@/assets/mocks/color-gray/chatgpt-image.svg"
import afterColorMuse from "@/assets/mocks/color-gray/muse.svg"
import afterColorRecraft from "@/assets/mocks/color-gray/recraft-v41.svg"
import afterColorVyb from "@/assets/mocks/color-gray/vyb-1.0.svg"

import beforeEdit from "@/assets/mocks/edit-coral/before.svg"
import afterEditChatgpt from "@/assets/mocks/edit-coral/chatgpt-image.svg"
import afterEditMuse from "@/assets/mocks/edit-coral/muse.svg"
import afterEditRecraft from "@/assets/mocks/edit-coral/recraft-v41.svg"
import afterEditVyb from "@/assets/mocks/edit-coral/vyb-1.0.svg"
import editDiffHeat from "@/assets/mocks/edit-coral/diff-heat.svg"

const MODEL_PANELS: ModelId[] = [
  "vyb-1.0",
  "chatgpt-image",
  "muse",
  "recraft-v41",
]

const afterByScenario: Record<
  ScenarioId,
  Partial<Record<ModelId, string>>
> = {
  "font-harbor": {
    "vyb-1.0": afterFontVyb,
    "chatgpt-image": afterFontChatgpt,
    muse: afterFontMuse,
    "recraft-v41": afterFontRecraft,
  },
  "color-gray": {
    "vyb-1.0": afterColorVyb,
    "chatgpt-image": afterColorChatgpt,
    muse: afterColorMuse,
    "recraft-v41": afterColorRecraft,
  },
  "edit-coral": {
    "vyb-1.0": afterEditVyb,
    "chatgpt-image": afterEditChatgpt,
    muse: afterEditMuse,
    "recraft-v41": afterEditRecraft,
  },
}

const beforeByScenario: Record<ScenarioId, string> = {
  "font-harbor": beforeFont,
  "color-gray": beforeColor,
  "edit-coral": beforeEdit,
}

export function getBeforeImage(scenarioId: ScenarioId): string {
  return beforeByScenario[scenarioId]
}

export function getAfterImage(
  scenarioId: ScenarioId,
  modelId: ModelId,
): string | undefined {
  return afterByScenario[scenarioId][modelId]
}

export function getDiffHeatOverlay(): string {
  return editDiffHeat
}

export function viewerModelIds(): ModelId[] {
  return MODEL_PANELS
}

export const MOCK_CAPTION =
  "Illustrative mock — not a live VybBench generation."
