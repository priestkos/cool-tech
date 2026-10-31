import { EventEncoder } from "@ag-ui/encoder";
import type { RunAgentInput } from "@ag-ui/core";
import { EventType } from "@ag-ui/core";

const HOST = "127.0.0.1";
const PORT = 8787;
const encoder = new EventEncoder();

let activeRun = false;

function contextToSystemPrompt(input: RunAgentInput): string {
  const parts: string[] = [
    "You are a CopilotKit generative UI demo assistant.",
    "Reply with helpful markdown and ```a2ui fenced A2UI v1.0 JSON lines when UI is needed.",
    "Use only components from the provided catalog context.",
  ];
  for (const entry of input.context ?? []) {
    if (typeof entry.content === "string") {
      parts.push(entry.content);
    }
  }
  return parts.join("\n\n");
}

function openAiMessages(input: RunAgentInput, system: string) {
  const messages: { role: string; content: string }[] = [
    { role: "system", content: system },
  ];
  for (const message of input.messages ?? []) {
    if (typeof message.content === "string") {
      messages.push({ role: message.role, content: message.content });
    }
  }
  return messages;
}

async function streamOpenAiAsAgUi(input: RunAgentInput): Promise<Response> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL;
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  if (!apiKey || !model) {
    return Response.json({ error: "Real mode not configured" }, { status: 503 });
  }

  const threadId = input.threadId ?? crypto.randomUUID();
  const runId = input.runId ?? crypto.randomUUID();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  const openAiRes = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: 4000,
      messages: openAiMessages(input, contextToSystemPrompt(input)),
    }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timeout));

  if (!openAiRes.ok || !openAiRes.body) {
    const text = await openAiRes.text();
    return Response.json({ error: text || "OpenAI request failed" }, { status: 502 });
  }

  const messageId = crypto.randomUUID();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (event: Record<string, unknown>) => {
        controller.enqueue(
          new TextEncoder().encode(encoder.encodeSSE(event as never)),
        );
      };
      enqueue({ type: EventType.RUN_STARTED, threadId, runId });
      enqueue({
        type: EventType.TEXT_MESSAGE_START,
        messageId,
        role: "assistant",
      });

      const reader = openAiRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") continue;
            try {
              const json = JSON.parse(payload) as {
                choices?: { delta?: { content?: string } }[];
              };
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                enqueue({
                  type: EventType.TEXT_MESSAGE_CONTENT,
                  messageId,
                  delta,
                });
              }
            } catch {
              /* ignore malformed SSE chunks */
            }
          }
        }
      } catch (error) {
        enqueue({
          type: EventType.RUN_ERROR,
          threadId,
          runId,
          message: error instanceof Error ? error.message : "Stream failed",
        });
      }
      enqueue({ type: EventType.TEXT_MESSAGE_END, messageId });
      enqueue({ type: EventType.RUN_FINISHED, threadId, runId });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

const server = Bun.serve({
  hostname: HOST,
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/status") {
      const realModeAvailable = Boolean(
        process.env.OPENAI_API_KEY && process.env.OPENAI_MODEL,
      );
      return Response.json({
        realModeAvailable,
        model: realModeAvailable ? process.env.OPENAI_MODEL : undefined,
      });
    }
    if (url.pathname === "/api/agent" && req.method === "POST") {
      if (activeRun) {
        return Response.json({ error: "Agent busy" }, { status: 429 });
      }
      activeRun = true;
      try {
        const input = (await req.json()) as RunAgentInput;
        const res = await streamOpenAiAsAgUi(input);
        if (res.body) {
          const wrapped = new ReadableStream<Uint8Array>({
            start(controller) {
              const reader = res.body!.getReader();
              const pump = (): void => {
                reader
                  .read()
                  .then(({ done, value }) => {
                    if (done) {
                      activeRun = false;
                      controller.close();
                      return;
                    }
                    if (value) controller.enqueue(value);
                    pump();
                  })
                  .catch((err) => {
                    activeRun = false;
                    controller.error(err);
                  });
              };
              pump();
            },
          });
          return new Response(wrapped, {
            headers: res.headers,
          });
        }
        activeRun = false;
        return res;
      } catch {
        activeRun = false;
        throw new Error("Agent run failed");
      }
    }
    return new Response("Not found", { status: 404 });
  },
});

console.log(`AG-UI server listening on http://${HOST}:${PORT} (pid ${server.port})`);
