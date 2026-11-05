import { PAL, fit, toHex } from "pixelfx";

export const PALETTE_PRESETS = [
  "default",
  "ice",
  "fire",
  "toxic",
  "holy",
  "shadow",
] as const;

export type PalettePresetId = (typeof PALETTE_PRESETS)[number];

const PRESET_MAP: Record<string, keyof typeof PAL> = {
  toxic: "poison",
};

export function coerceHex(input: string): string | null {
  const raw = input.trim();
  if (/^#[0-9a-f]{3}$/i.test(raw)) {
    const h = raw.slice(1);
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  }
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
  if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw.toLowerCase()}`;
  return null;
}

export function fitHexPalette(colors: string[], length: number): string[] {
  if (length <= 0) return colors.map((c) => coerceHex(c) ?? "#000000");
  const fitted = fit(colors.map((c) => coerceHex(c) ?? "#000000"), length);
  return fitted.map((c) => toHex(c));
}

export function buildPaletteOption(
  defaultPalette: string[] | undefined,
  preset: string,
  editedSwatches: string[],
): string[] | undefined {
  const targetLen = defaultPalette?.length ?? 0;
  if (preset !== "default") {
    const key = PRESET_MAP[preset] ?? preset;
    const ramp = PAL[key as keyof typeof PAL];
    if (!ramp) return defaultPalette;
    if (targetLen > 0) return fitHexPalette(ramp, targetLen);
    return [...ramp];
  }
  if (!defaultPalette?.length) return undefined;
  if (!editedSwatches.length) return undefined;
  const merged = defaultPalette.map((def, i) => {
    const edited = editedSwatches[i];
    return edited ? (coerceHex(edited) ?? def) : def;
  });
  return fitHexPalette(merged, defaultPalette.length);
}

export function defaultSwatches(palette: string[] | undefined): string[] {
  return palette ? palette.map((c) => c.toLowerCase()) : [];
}
