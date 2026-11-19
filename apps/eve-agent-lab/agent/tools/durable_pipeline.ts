import { defineWorkflowTool } from "eve/tools";
import { sleep } from "eve/workflow";
import { z } from "zod";

async function prepareStepLog(): Promise<void> {
  "use step";
  const { beginStepLogSession, markReplayMode, readStepLog } = await import("../lib/step-log.js");
  const prior = readStepLog().entries;
  if (prior.length === 0) {
    beginStepLogSession();
  } else {
    markReplayMode();
  }
}

async function runStep(step: string): Promise<void> {
  "use step";
  const { recordWorkflowStep } = await import("../lib/step-log.js");
  recordWorkflowStep(step);
  await new Promise((resolve) => setTimeout(resolve, 250));
}

export default defineWorkflowTool({
  description:
    "Run a multi-step durable refund pipeline for crash/resume demos. Each step is checkpointed.",
  inputSchema: z.object({
    orderId: z.string().min(1),
  }),
  async execute({ orderId }, ctx) {
    "use workflow";
    if (ctx.abortSignal.aborted) {
      return { orderId, status: "aborted" };
    }
    await prepareStepLog();
    await runStep("validate-order");
    await sleep("1s");
    await runStep("reserve-funds");
    await sleep("1s");
    await runStep("notify-customer");
    return { orderId, status: "completed", checkpointed: true };
  },
});