import { describe, expect, test } from "bun:test";
import {
  detectMockScenario,
  resolveMockResponse,
} from "../src/lib/mock-responder";

describe("mock responder", () => {
  test("maps weather prompts", () => {
    expect(detectMockScenario("What's the weather in San Francisco?")).toBe(
      "weather",
    );
    expect(resolveMockResponse("forecast for NYC")).toContain("CardHeader");
  });

  test("maps framework comparison", () => {
    expect(detectMockScenario("Compare React and Vue")).toBe(
      "framework-compare",
    );
  });

  test("maps signup form", () => {
    expect(detectMockScenario("Show me a signup form")).toBe("signup-form");
  });

  test("maps cloud table", () => {
    expect(detectMockScenario("Compare cloud providers in a table")).toBe(
      "cloud-table",
    );
  });

  test("falls back for unknown prompts", () => {
    expect(detectMockScenario("hello there")).toBe("fallback");
    expect(resolveMockResponse("hello")).toContain("FollowUpBlock");
  });
});
