import { describe, expect, test } from "bun:test";
import { auroraMeshConfigSchema } from "../components/heroes/aurora-mesh/schema";
import { splitHeadlineConfigSchema } from "../components/heroes/split-headline/schema";
import { inkFlowConfigSchema } from "../components/heroes/ink-flow/schema";
import { schemaToControls } from "./schema-controls";

describe("schemaToControls", () => {
  test("maps aurora-mesh field types to controls", () => {
    const controls = schemaToControls(auroraMeshConfigSchema);
    const byKey = Object.fromEntries(controls.map((c) => [c.key, c.kind]));
    expect(byKey.colors).toBe("color-array");
    expect(byKey.background).toBe("color");
    expect(byKey.speed).toBe("number");
    expect(byKey.pointer).toBe("boolean");
    expect(byKey.poster).toBe("skip");

    const parsed = auroraMeshConfigSchema.safeParse({
      ...Object.fromEntries(
        controls
          .filter((c) => c.kind !== "skip")
          .map((c) => {
            if (c.kind === "color-array") return [c.key, ["#112233", "#445566", "#778899"]];
            if (c.kind === "boolean") return [c.key, false];
            if (c.kind === "number") return [c.key, c.max !== undefined ? Math.min(1, c.max) : 1];
            if (c.kind === "color" || c.kind === "string") return [c.key, "#0b0c10"];
            return [c.key, undefined];
          }),
      ),
    });
    expect(parsed.success).toBe(true);
  });

  test("maps split-headline enums and colors", () => {
    const controls = schemaToControls(splitHeadlineConfigSchema);
    const intro = controls.find((c) => c.key === "intro");
    expect(intro?.kind).toBe("enum");
    expect(intro?.options).toEqual(["rise", "scatter", "type"]);

    const accent = controls.find((c) => c.key === "accent");
    expect(accent?.kind).toBe("color");

    const sample = {
      intro: "rise" as const,
      stagger: 20,
      accent: "oklch(0.62 0.2 262)",
      radius: 1.4,
      strength: 0.8,
      pointer: true,
      idle: false,
    };
    expect(splitHeadlineConfigSchema.safeParse(sample).success).toBe(true);
  });

  test("maps ink-flow detail enum", () => {
    const detail = schemaToControls(inkFlowConfigSchema).find((c) => c.key === "detail");
    expect(detail?.kind).toBe("enum");
    expect(detail?.options).toEqual(["low", "medium", "high"]);
  });
});
