import { describe, expect, test } from "bun:test";
import { buildPaletteOption, coerceHex, fitHexPalette } from "./palette";

describe("palette options", () => {
  test("coerces shorthand and bare hex", () => {
    expect(coerceHex("#abc")).toBe("#aabbcc");
    expect(coerceHex("aabbcc")).toBe("#aabbcc");
    expect(coerceHex("nope")).toBeNull();
  });

  test("maps preset ramps to effect palette length", () => {
    const def = ["#111111", "#222222", "#333333", "#444444"];
    const ice = buildPaletteOption(def, "ice", []);
    expect(ice).toHaveLength(4);
    expect(buildPaletteOption(def, "default", ["#ff0000", "", "", ""])).toEqual([
      "#ff0000",
      "#222222",
      "#333333",
      "#444444",
    ]);
  });

  test("fitHexPalette keeps endpoints", () => {
    const out = fitHexPalette(["#000000", "#ffffff"], 4);
    expect(out[0]).toBe("#000000");
    expect(out[out.length - 1]).toBe("#ffffff");
  });
});
