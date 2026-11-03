import { describe, expect, test } from "bun:test"
import { exportAnimationCss } from "./css-export"
import { NAMED_EASINGS } from "./bezier"
import type { AnimationSpec } from "./types"

describe("css export", () => {
  test("includes keyframes and animation shorthand", () => {
    const spec: AnimationSpec = {
      delayMs: 50,
      durationMs: 300,
      easing: { kind: "named", name: "ease-out", points: NAMED_EASINGS["ease-out"] },
      keyframes: [
        { offset: 0, translateY: 10, opacity: 0, scale: 0.95 },
        { offset: 1, translateY: 0, opacity: 1, scale: 1 },
      ],
    }
    const css = exportAnimationCss(spec)
    expect(css).toContain("@keyframes motion-copy-enter")
    expect(css).toContain("animation: motion-copy-enter 300ms ease-out 50ms both")
    expect(css).toContain("translateY(10px)")
  })
})
