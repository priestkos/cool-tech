import {
  clearFrame,
  composite,
  createFrame,
  createFx,
  type EffectModule,
  type FxOptions,
} from "pixelfx";

export function normalizedMeta(mod: EffectModule) {
  const meta = mod.meta;
  return {
    fps: meta.fps ?? 30,
    duration: meta.duration ?? 1,
    loop: meta.loop ?? false,
    size: meta.size,
    origin: meta.origin,
  };
}

export function frameCount(mod: EffectModule): number {
  const { duration, loop, fps } = normalizedMeta(mod);
  return Math.max(1, Math.round(duration * fps) + (loop ? 0 : 1));
}

export function stepFxToTime(
  mod: EffectModule,
  timeSec: number,
  options: FxOptions,
): void {
  const meta = normalizedMeta(mod);
  const step = 1 / meta.fps;
  const inst = createFx(mod, {
    x: meta.origin[0],
    y: meta.origin[1],
    ...options,
  });
  const steps = Math.max(0, Math.floor(timeSec / step + 1e-9));
  for (let i = 0; i < steps; i++) inst.update(step);
}

export function renderFxPixelsAtTime(
  mod: EffectModule,
  timeSec: number,
  options: FxOptions,
  placement: { x: number; y: number },
): Uint8ClampedArray {
  const meta = normalizedMeta(mod);
  const [fw, fh] = meta.size;
  const frame = createFrame(fw, fh);
  const inst = createFx(mod, { ...options, x: placement.x, y: placement.y });
  const step = 1 / meta.fps;
  const steps = Math.max(0, Math.floor(timeSec / step + 1e-9));
  for (let i = 0; i < steps; i++) inst.update(step);
  clearFrame(frame);
  inst.draw(frame, "back");
  inst.draw(frame, "front");
  const out = new Uint8ClampedArray(fw * fh * 4);
  composite(frame, out, null);
  return out;
}

export function pixelsEqual(a: Uint8ClampedArray, b: Uint8ClampedArray): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
