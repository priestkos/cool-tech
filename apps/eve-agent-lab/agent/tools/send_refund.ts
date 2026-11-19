import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

export default defineTool({
  description: "Send a refund to the mock ledger. Requires human approval in the lab UI.",
  inputSchema: z.object({
    orderId: z.string().min(1),
    amount: z.number().positive(),
    reason: z.string().min(1),
  }),
  approval: {
    request: always(),
    prompt: ({ input }) =>
      `Approve refund of $${input.amount.toFixed(2)} for order ${input.orderId}? Reason: ${input.reason}`,
  },
  async execute(input) {
    return {
      ...input,
      status: "refunded",
      refundId: `RF-${input.orderId}`,
      ledger: "mock",
    };
  },
});