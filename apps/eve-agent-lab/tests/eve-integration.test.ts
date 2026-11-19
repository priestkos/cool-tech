import { afterAll, describe, expect, test } from "bun:test";
import { Client } from "eve/client";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { interactionIdFromOpened, toolNameFromEvent } from "./helpers";

const baseUrl = process.env.EVE_LAB_URL ?? "http://127.0.0.1:5173";
const client = new Client({ baseUrl });

async function collectTurn(delivery: Awaited<ReturnType<Client["sessions"]["create"]>>["delivery"]) {
  const events = [];
  for await (const event of delivery.stream()) {
    events.push(event);
  }
  return events;
}

async function sendAndCollect(message: string) {
  const created = await client.sessions.create({ message });
  const events = await collectTurn(created.delivery);
  return { session: created.session, events };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const health = await client.health();
      if (health.status === "ready") return;
    } catch {
      // retry
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("eve server not ready");
}

describe("eve agent lab integration", () => {
  test("mock model issues lookup_order then send_refund", async () => {
    await waitForServer();
    const { events } = await sendAndCollect("Look up order ORD-1234 and start a refund");
    const toolNames = events
      .map((event) => toolNameFromEvent(event))
      .filter((name): name is string => Boolean(name));
    expect(toolNames).toContain("lookup_order");
    expect(toolNames).toContain("send_refund");
    expect(events.some((event) => event.type === "turn.paused")).toBe(true);
  }, 120_000);

  test("approval gate blocks until deny", async () => {
    await waitForServer();
    const { session, events } = await sendAndCollect("Look up order ORD-1234 and start a refund");
    expect(events.some((event) => event.type === "interaction.opened")).toBe(true);
    const opened = events.find((event) => event.type === "interaction.opened");
    const interactionId = opened ? interactionIdFromOpened(opened) : undefined;
    if (!interactionId) throw new Error("expected interaction.opened");
    const denyDelivery = await session.respond([{ interactionId, optionId: "deny" }]);
    const after = await collectTurn(denyDelivery);
    const refundSettled = after.find((event) => {
      if (event.type !== "call.settled") return false;
      const data = (event as { data?: { outcome?: string; output?: { code?: string } } }).data;
      return data?.outcome === "rejected" || data?.output?.code === "TOOL_EXECUTION_DENIED";
    });
    expect(refundSettled).toBeDefined();
  }, 120_000);

  test("instructions edit is persisted to agent folder", async () => {
    const instructionsPath = path.join(process.cwd(), "agent", "instructions.md");
    const marker = `LAB-MARKER-${Date.now()}`;
    const previous = readFileSync(instructionsPath, "utf8");
    try {
      await fetch(`${baseUrl}/lab/api/agent-file`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: "instructions.md", content: `${previous}\n${marker}\n` }),
      });
      const onDisk = readFileSync(instructionsPath, "utf8");
      expect(onDisk).toContain(marker);
    } finally {
      await fetch(`${baseUrl}/lab/api/agent-file`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ path: "instructions.md", content: previous }),
      });
    }
  });

  test("trace spans are recorded to lab memory exporter file", async () => {
    await sendAndCollect("Look up order ORD-1234");
    const tracePath = path.join(process.cwd(), ".eve", "lab-spans.json");
    expect(existsSync(tracePath)).toBe(true);
    const payload = JSON.parse(readFileSync(tracePath, "utf8")) as { spans: unknown[] };
    expect(payload.spans.length).toBeGreaterThan(0);
  }, 120_000);

  test("durable pipeline steps log once per step across crash simulation", async () => {
    await fetch(`${baseUrl}/lab/api/reset-steps`, { method: "POST" });

    const first = await sendAndCollect("Run the durable pipeline crash demo");
    expect(first.events.some((e) => toolNameFromEvent(e) === "durable_pipeline")).toBe(true);

    await fetch(`${baseUrl}/lab/api/simulate-crash`, { method: "POST" });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const resumeClient = new Client({ baseUrl });
    const attached = resumeClient.sessions.attach(first.session.state?.sessionId ?? "");
    const resumeDelivery = await attached.send("continue the durable pipeline", { turnPolicy: "queue" });
    await collectTurn(resumeDelivery);

    const stepPath = path.join(process.cwd(), ".eve", "lab-step-log.json");
    const steps = JSON.parse(readFileSync(stepPath, "utf8")) as {
      entries: Array<{ step: string }>;
    };
    const finalCounts = steps.entries.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.step] = (acc[entry.step] ?? 0) + 1;
      return acc;
    }, {});
    for (const step of ["validate-order", "reserve-funds", "notify-customer"]) {
      expect(finalCounts[step] ?? 0).toBeLessThanOrEqual(1);
    }
    expect(steps.entries.length).toBeGreaterThan(0);
  }, 180_000);
});

afterAll(async () => {
  await client.health().catch(() => undefined);
});