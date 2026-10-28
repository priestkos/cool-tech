import { describe, expect, test } from "bun:test";
import { generateHeroJsx } from "./generate-jsx";

describe("generateHeroJsx", () => {
  test("prints component with config and content objects", () => {
    const jsx = generateHeroJsx(
      "SplitHeadlineHero",
      { intro: "scatter", stagger: 28, accent: "#6366f1", radius: 1.4, strength: 1, pointer: true, idle: true },
      { headline: "Ship faster", primaryCta: { label: "Start", href: "#start" } },
    );
    expect(jsx.startsWith("<SplitHeadlineHero")).toBe(true);
    expect(jsx).toContain('"intro": "scatter"');
    expect(jsx).toContain('"headline": "Ship faster"');
    expect(jsx.endsWith("/>")).toBe(true);
  });
});
