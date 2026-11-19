import { describe, expect, test } from "bun:test";
import { labMockResponder } from "../../agent/lib/mock-script";

describe("labMockResponder", () => {
  test("starts refund flow with lookup_order", () => {
    const response = labMockResponder({
      messages: [],
      userMessages: ["lookup order ord-1234"],
      lastUserMessage: "lookup order ord-1234",
      userMessageCount: 1,
      tools: [],
      toolResults: [],
    });
    expect(response).toEqual({
      toolCalls: [{ name: "lookup_order", input: { orderId: "ORD-1234" } }],
    });
  });

  test("requests send_refund after lookup result", () => {
    const response = labMockResponder({
      messages: [],
      userMessages: ["lookup"],
      lastUserMessage: "lookup",
      userMessageCount: 1,
      tools: [],
      toolResults: [
        { id: "1", name: "lookup_order", output: {}, isError: false },
      ],
    });
    expect(response.toolCalls?.[0]?.name).toBe("send_refund");
  });

  test("triggers durable pipeline on crash keywords", () => {
    const response = labMockResponder({
      messages: [],
      userMessages: ["run durable pipeline crash demo"],
      lastUserMessage: "run durable pipeline crash demo",
      userMessageCount: 1,
      tools: [],
      toolResults: [],
    });
    expect(response.toolCalls?.[0]?.name).toBe("durable_pipeline");
  });
});