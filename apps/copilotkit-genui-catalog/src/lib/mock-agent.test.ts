import { describe, expect, test } from "bun:test";
import { EventType } from "@ag-ui/client";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";
import {
  extractA2uiFenceBodies,
  parseA2uiLines,
} from "./a2ui";
import { buildMockEventSequence } from "./mock-agent";
import {
  allMockReplyBodies,
  matchIntent,
  replyForIntent,
  SUGGESTION_CHIPS,
  type MockIntentId,
} from "./mock-intents";
import { validateA2uiComponentNode } from "./catalog-schema";

describe("mock intent matcher", () => {
  test("maps each suggestion chip prompt to its reply id", () => {
    for (const chip of SUGGESTION_CHIPS) {
      expect(matchIntent(chip.prompt)).toBe(chip.id);
      expect(replyForIntent(chip.id as MockIntentId)).toContain("```a2ui");
    }
  });

  test("unknown text falls back", () => {
    expect(matchIntent("tell me a joke")).toBeNull();
  });
});

describe("mock agent event sequence", () => {
  test("emits RUN_STARTED through RUN_FINISHED with stable message id", () => {
    const events = buildMockEventSequence("thread", "run", "Show a chart");
    expect(events[0]?.type).toBe(EventType.RUN_STARTED);
    expect(events.at(-1)?.type).toBe(EventType.RUN_FINISHED);
    const start = events.find((e) => e.type === EventType.TEXT_MESSAGE_START);
    const end = events.find((e) => e.type === EventType.TEXT_MESSAGE_END);
    expect(start && "messageId" in start && end && "messageId" in end).toBe(true);
    if (start && "messageId" in start && end && "messageId" in end) {
      expect(start.messageId).toBe(end.messageId);
    }
  });
});

describe("scripted A2UI fences", () => {
  test("every mock reply parses and validates component props", () => {
    for (const body of allMockReplyBodies()) {
      for (const fence of extractA2uiFenceBodies(body)) {
        const ops = parseA2uiLines(fence);
        for (const op of ops) {
          const components = op.updateComponents?.components ?? [];
          if (op.createSurface?.components) {
            components.push(...op.createSurface.components);
          }
          for (const node of components) {
            if (!node?.component || typeof node.component !== "string") continue;
            if (!standardUI.components.has(node.component)) continue;
            const result = validateA2uiComponentNode(node);
            expect(result.success).toBe(true);
          }
        }
      }
    }
  });
});
