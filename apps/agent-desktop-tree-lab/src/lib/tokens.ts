/**
 * Token estimates for this mock lab only — not real tokenizer output.
 *
 * Text: ceil(UTF-8 byte length / 4) — common rule-of-thumb for English-ish text.
 * Image: ceil(width × height / 750) — Anthropic vision approximation for Claude;
 * https://docs.anthropic.com/en/docs/build-with-claude/vision
 */

export function estimateTextTokens(jsonMinified: string): number {
  const bytes = new TextEncoder().encode(jsonMinified).length
  return Math.ceil(bytes / 4)
}

export function estimateImageTokens(width: number, height: number): number {
  return Math.ceil((width * height) / 750)
}

export function formatRatio(tree: number, image: number): string {
  if (tree === 0) return "—"
  const ratio = image / tree
  return `${ratio.toFixed(1)}× screenshot vs tree`
}

export const DEFAULT_WINDOW_SIZE = { width: 520, height: 380 }
export const FULLSCREEN_ESTIMATE_SIZE = { width: 1440, height: 900 }

export const TOKEN_ESTIMATE_SOURCES = {
  text: "UTF-8 bytes ÷ 4 (rule of thumb, not a model tokenizer)",
  image:
    "Anthropic Claude vision approximation: pixels ÷ 750 — https://docs.anthropic.com/en/docs/build-with-claude/vision",
} as const
