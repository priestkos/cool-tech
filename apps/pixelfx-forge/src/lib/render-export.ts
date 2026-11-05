import {
  backdrop,
  clearFrame,
  composite,
  createFrame,
  createFx,
  type EffectModule,
  type FxOptions,
} from "pixelfx";
import { frameCount, normalizedMeta } from "./frame-step";
import {
  buildAsepriteJson,
  computeSheetLayout,
  exportFileBase,
  type SheetLayout,
} from "./spritesheet";

export function renderSpriteSheet(
  mod: EffectModule,
  effectId: string,
  options: FxOptions,
): {
  canvas: HTMLCanvasElement;
  layout: SheetLayout;
  json: ReturnType<typeof buildAsepriteJson>;
  baseName: string;
} {
  const meta = normalizedMeta(mod);
  const [fw, fh] = meta.size;
  const count = frameCount(mod);
  const layout = computeSheetLayout(count, fw, fh);
  const canvas = document.createElement("canvas");
  canvas.width = layout.width;
  canvas.height = layout.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");

  const frame = createFrame(fw, fh);
  const img = ctx.createImageData(fw, fh);
  const inst = createFx(mod, {
    x: meta.origin[0],
    y: meta.origin[1],
    ...options,
  });
  const step = 1 / meta.fps;

  for (let i = 0; i < count; i++) {
    if (i > 0) inst.update(step);
    clearFrame(frame);
    inst.draw(frame, "back");
    inst.draw(frame, "front");
    composite(frame, img.data, null);
    ctx.putImageData(img, (i % layout.cols) * fw, Math.floor(i / layout.cols) * fh);
  }

  const baseName = exportFileBase(effectId);
  const json = buildAsepriteJson(baseName, fw, fh, meta.fps, layout);
  return { canvas, layout, json, baseName };
}

export function backdropForMode(
  mode: "checker" | "dark" | "ground",
  w: number,
  h: number,
  groundY: number,
): Uint32Array | null {
  if (mode === "checker") return null;
  if (mode === "dark") return backdrop("dark", w, h, groundY);
  return backdrop("ground", w, h, groundY);
}
