import type { PalettePresetId } from "./palette";

export type BackgroundMode = "checker" | "dark" | "ground";

export interface ForgeUrlState {
  id: string;
  seed: number;
  speed: number;
  scale: number;
  loop: boolean;
  flip: boolean;
  bg: BackgroundMode;
  preset: PalettePresetId | string;
  swatches: string[];
  scrub: number;
  showBody: boolean;
  showTarget: boolean;
}

export const DEFAULT_URL_STATE: ForgeUrlState = {
  id: "ice/frost-nova",
  seed: 4,
  speed: 1,
  scale: 3,
  loop: false,
  flip: false,
  bg: "checker",
  preset: "default",
  swatches: [],
  scrub: 0,
  showBody: true,
  showTarget: true,
};

function parseBool(value: string | null, fallback: boolean): boolean {
  if (value === null) return fallback;
  return value === "1" || value === "true";
}

function parseNum(value: string | null, fallback: number): number {
  if (value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseHash(hash: string): Partial<ForgeUrlState> {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return {};
  const params = new URLSearchParams(raw);
  const swatches: string[] = [];
  for (let i = 0; i < 12; i++) {
    const v = params.get(`sw${i}`);
    if (v) swatches.push(v);
  }
  const bg = params.get("bg");
  return {
    id: params.get("id") ?? undefined,
    seed: parseNum(params.get("seed"), DEFAULT_URL_STATE.seed),
    speed: parseNum(params.get("speed"), DEFAULT_URL_STATE.speed),
    scale: parseNum(params.get("scale"), DEFAULT_URL_STATE.scale),
    loop: parseBool(params.get("loop"), DEFAULT_URL_STATE.loop),
    flip: parseBool(params.get("flip"), DEFAULT_URL_STATE.flip),
    bg:
      bg === "dark" || bg === "ground" || bg === "checker"
        ? bg
        : DEFAULT_URL_STATE.bg,
    preset: (params.get("preset") as PalettePresetId) ?? DEFAULT_URL_STATE.preset,
    swatches,
    scrub: parseNum(params.get("scrub"), DEFAULT_URL_STATE.scrub),
    showBody: parseBool(params.get("body"), DEFAULT_URL_STATE.showBody),
    showTarget: parseBool(params.get("target"), DEFAULT_URL_STATE.showTarget),
  };
}

export function serializeHash(state: ForgeUrlState): string {
  const params = new URLSearchParams();
  params.set("id", state.id);
  params.set("seed", String(state.seed));
  params.set("speed", String(state.speed));
  params.set("scale", String(state.scale));
  params.set("loop", state.loop ? "1" : "0");
  params.set("flip", state.flip ? "1" : "0");
  params.set("bg", state.bg);
  params.set("preset", String(state.preset));
  params.set("scrub", String(Math.round(state.scrub * 1000) / 1000));
  params.set("body", state.showBody ? "1" : "0");
  params.set("target", state.showTarget ? "1" : "0");
  state.swatches.forEach((sw, i) => {
    if (sw) params.set(`sw${i}`, sw);
  });
  return `#${params.toString()}`;
}

export function mergeUrlState(partial: Partial<ForgeUrlState>): ForgeUrlState {
  return { ...DEFAULT_URL_STATE, ...partial };
}
