import type { MockModelRequest, MockModelResponse } from "eve/evals";

export function labMockResponder(request: MockModelRequest): MockModelResponse {
  const message = (request.lastUserMessage ?? "").toLowerCase();
  const toolResults = request.toolResults;

  const finishedDurable = toolResults.some((result) => result.name === "durable_pipeline");
  if (finishedDurable) {
    return {
      text: "The durable pipeline finished. Workflow checkpoints skipped replay for completed steps.",
    };
  }

  const finishedRefund = toolResults.some((result) => result.name === "send_refund");
  if (finishedRefund) {
    return { text: "Refund flow complete. Summarize what was approved and the mock ledger result." };
  }

  const lookedUp = toolResults.some((result) => result.name === "lookup_order");
  if (lookedUp) {
    return {
      toolCalls: [
        {
          name: "send_refund",
          input: { orderId: "ORD-1234", amount: 49.99, reason: "damaged item (lab fixture)" },
        },
      ],
    };
  }

  if (message.includes("durable") || message.includes("crash") || message.includes("checkpoint")) {
    return { toolCalls: [{ name: "durable_pipeline", input: { orderId: "ORD-1234" } }] };
  }

  if (message.includes("refund") || message.includes("order") || message.includes("lookup")) {
    return { toolCalls: [{ name: "lookup_order", input: { orderId: "ORD-1234" } }] };
  }

  return {
    text:
      "Eve Agent Lab mock agent ready. Try: “Look up order ORD-1234 and start a refund” or “Run the durable pipeline crash demo”.",
  };
}