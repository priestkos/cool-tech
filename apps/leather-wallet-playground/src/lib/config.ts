export type PlaygroundCard = {
  title: string
  description: string
  content: string
  /** Tailwind classes on WalletCard, e.g. bg-sky-600 text-white */
  colorClass: string
}

export type PlaygroundConfig = {
  cards: PlaygroundCard[]
  pocketLabel: string
  /** Wallet width in CSS pixels (scales the @container wallet). */
  widthPx: number
}

export const MAX_CARDS = 8
export const MIN_CARDS = 1
export const MIN_WIDTH = 280
export const MAX_WIDTH = 480
export const DEFAULT_WIDTH = 384

export const COLOR_PRESETS: { id: string; label: string; className: string }[] =
  [
    { id: "sky", label: "Sky", className: "bg-sky-600 text-white" },
    { id: "violet", label: "Violet", className: "bg-violet-600 text-white" },
    { id: "emerald", label: "Emerald", className: "bg-emerald-700 text-white" },
    { id: "amber", label: "Amber", className: "bg-amber-500 text-amber-950" },
    { id: "rose", label: "Rose", className: "bg-rose-600 text-white" },
    { id: "slate", label: "Slate", className: "bg-slate-700 text-white" },
  ]

export const DEFAULT_CONFIG: PlaygroundConfig = {
  pocketLabel: "Fiction Pass",
  widthPx: DEFAULT_WIDTH,
  cards: [
    {
      title: "Orbital Library",
      description: "Member",
      content: "Shelf access •••• 4821",
      colorClass: "bg-sky-600 text-white",
    },
    {
      title: "Lunar Transit",
      description: "Monthly",
      content: "Valid thru 12/2099 •••• 9012",
      colorClass: "bg-violet-600 text-white",
    },
    {
      title: "Cloud Arcade",
      description: "Credits",
      content: "Balance 128 tokens •••• 3340",
      colorClass: "bg-emerald-700 text-white",
    },
  ],
}

export function clampConfig(raw: Partial<PlaygroundConfig>): PlaygroundConfig {
  const cards = (raw.cards ?? DEFAULT_CONFIG.cards)
    .slice(0, MAX_CARDS)
    .map((card, index) => {
      const fallback = DEFAULT_CONFIG.cards[index % DEFAULT_CONFIG.cards.length]
      return {
        title: sanitizeField(card?.title, fallback.title, 48),
        description: sanitizeField(card?.description, fallback.description, 32),
        content: sanitizeField(card?.content, fallback.content, 80),
        colorClass: sanitizeColorClass(
          card?.colorClass,
          fallback.colorClass,
        ),
      }
    })

  while (cards.length < MIN_CARDS) {
    cards.push({ ...DEFAULT_CONFIG.cards[cards.length % DEFAULT_CONFIG.cards.length] })
  }

  const widthPx = clampNumber(raw.widthPx ?? DEFAULT_WIDTH, MIN_WIDTH, MAX_WIDTH)

  return {
    pocketLabel: sanitizeField(
      raw.pocketLabel,
      DEFAULT_CONFIG.pocketLabel,
      32,
    ),
    widthPx,
    cards,
  }
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, Math.round(value)))
}

function sanitizeField(value: string | undefined, fallback: string, max: number) {
  if (typeof value !== "string") return fallback
  const trimmed = value.trim().slice(0, max)
  return trimmed.length > 0 ? trimmed : fallback
}

function sanitizeColorClass(value: string | undefined, fallback: string) {
  if (typeof value !== "string" || value.length > 120) return fallback
  const known = COLOR_PRESETS.some((p) => p.className === value)
  if (known) return value
  if (/^[\w\-:/\[\].% ]+$/.test(value) && value.includes("bg-")) return value
  return fallback
}
