import { describe, expect, test } from "bun:test";
import { buildAsepriteJson, computeSheetLayout } from "./spritesheet";

describe("sprite sheet layout", () => {
  test("computes grid with correct frame count", () => {
    const layout = computeSheetLayout(30, 96, 64);
    expect(layout.cols * layout.rows).toBeGreaterThanOrEqual(30);
    expect(layout.width).toBe(layout.cols * 96);
    expect(layout.height).toBe(layout.rows * 64);
  });

  test("aseprite json includes rects and durations", () => {
    const layout = computeSheetLayout(8, 32, 32);
    const json = buildAsepriteJson("pixelfx-test", 32, 32, 30, layout);
    expect(Object.keys(json.frames).length).toBe(8);
    const first = json.frames["pixelfx-test_0"];
    expect(first.frame.w).toBe(32);
    expect(first.duration).toBe(Math.round(1000 / 30));
  });
});
