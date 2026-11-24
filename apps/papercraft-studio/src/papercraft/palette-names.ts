/** Named palettes from vendored assets/palettes.json (excluding _about). */
export const PALETTE_NAMES = [
  "storybook-autumn",
  "golden-hour",
  "desert-noon",
  "snow-cabin",
  "blossom-spring",
  "misty-forest",
  "jungle",
  "dusk-violet",
  "lantern-night",
  "sea-teal",
  "industrial-tin",
] as const

export type PaletteName = (typeof PALETTE_NAMES)[number]

export function moodForPalette(name: PaletteName): "golden" | "dusk" | "night" | undefined {
  if (name === "dusk-violet") return "dusk"
  if (name === "lantern-night") return "night"
  if (name === "golden-hour") return "golden"
  return undefined
}