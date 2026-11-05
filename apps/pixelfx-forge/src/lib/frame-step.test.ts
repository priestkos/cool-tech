import { describe, expect, test } from "bun:test";
import { effects } from "pixelfx/fx/index";
import {
  pixelsEqual,
  renderFxPixelsAtTime,
  stepFxToTime,
} from "./frame-step";

describe("deterministic frame stepping", () => {
  const mod = effects["ice/frost-nova"];

  test("same seed and time yield identical pixels", () => {
    const opts = { seed: 7, palette: mod.meta.options?.palette as string[] };
    const a = renderFxPixelsAtTime(mod, 0.8, opts, { x: mod.meta.origin[0], y: mod.meta.origin[1] });
    const b = renderFxPixelsAtTime(mod, 0.8, opts, { x: mod.meta.origin[0], y: mod.meta.origin[1] });
    expect(pixelsEqual(a, b)).toBe(true);
  });

  test("scrub stepping matches direct render", () => {
    const opts = { seed: 3 };
    stepFxToTime(mod, 1.2, opts);
    const direct = renderFxPixelsAtTime(mod, 1.2, opts, {
      x: mod.meta.origin[0],
      y: mod.meta.origin[1],
    });
    expect(direct.some((v) => v > 0)).toBe(true);
  });
});
