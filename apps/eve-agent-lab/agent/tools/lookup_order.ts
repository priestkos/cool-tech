import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Look up a fictional order for the Eve Agent Lab fixture.",
  inputSchema: z.object({
    orderId: z.string().min(1),
  }),
  async execute({ orderId }) {
    return {
      orderId,
      status: "shipped",
      total: 49.99,
      items: [{ sku: "LAB-MUG", title: "Ceramic mug (demo)" }],
    };
  },
});