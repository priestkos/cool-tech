import { describe, expect, test } from "bun:test";
import {
  DEFAULT_URL_STATE,
  mergeUrlState,
  parseHash,
  serializeHash,
} from "./url-state";

describe("url hash state", () => {
  test("round-trips core fields", () => {
    const state = mergeUrlState({
      id: "fire/fireball",
      seed: 12,
      speed: 0.5,
      scale: 4,
      loop: true,
      flip: true,
      bg: "dark",
      preset: "fire",
      swatches: ["#112233", "#445566"],
      scrub: 1.25,
      showBody: false,
      showTarget: true,
    });
    const parsed = parseHash(serializeHash(state));
    expect(parsed.id).toBe(state.id);
    expect(parsed.seed).toBe(state.seed);
    expect(parsed.speed).toBe(state.speed);
    expect(parsed.scale).toBe(state.scale);
    expect(parsed.loop).toBe(true);
    expect(parsed.flip).toBe(true);
    expect(parsed.bg).toBe("dark");
    expect(parsed.preset).toBe("fire");
    expect(parsed.swatches).toEqual(state.swatches);
    expect(parsed.scrub).toBeCloseTo(1.25);
    expect(parsed.showBody).toBe(false);
    expect(parsed.showTarget).toBe(true);
  });

  test("empty hash falls back to defaults", () => {
    const parsed = parseHash("");
    expect(parsed.id).toBeUndefined();
    expect(mergeUrlState(parsed).seed).toBe(DEFAULT_URL_STATE.seed);
  });
});
