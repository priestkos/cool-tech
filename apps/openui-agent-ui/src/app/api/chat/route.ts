import OpenAI from "openai";
import { generateSystemPrompt, type LibrarySpec } from "@openuidev/lang-core";
import librarySpec from "@/lib/openui.spec.json";
import { resolveMockResponse } from "@/lib/mock-responder";
import { getAppMode } from "@/lib/server-mode";
import { streamTextChunks } from "@/lib/stream-text";

type ChatMessage = { role: string; content: string };

function lastUserMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role === "user" && msg.content.trim()) {
      return msg.content.trim();
    }
  }
  return "";
}

export async function POST(request: Request) {
  let body: { messages?: ChatMessage[]; message?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const messages = body.messages ?? [];
  const userText =
    body.message?.trim() || lastUserMessage(messages) || "Hello";

  if (getAppMode() === "mock") {
    const openuiLang = resolveMockResponse(userText);
    const stream = await streamTextChunks(openuiLang);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-OpenUI-Mode": "mock",
      },
    });
  }

  const apiKey = process.env.THESYS_API_KEY?.trim();
  if (!apiKey) {
    return new Response("Live mode is not configured", { status: 503 });
  }

  const openuiInstructions = generateSystemPrompt({
    cloud: true,
    library: librarySpec as LibrarySpec,
  });

  const gateway = new OpenAI({
    apiKey,
    baseURL: "https://api.thesys.dev/v1/embed",
  });

  const completion = await gateway.chat.completions.create({
    model: "openai/gpt-5",
    messages: [
      { role: "system", content: openuiInstructions },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
      ...(messages.length === 0
        ? [{ role: "user" as const, content: userText }]
        : []),
    ],
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-OpenUI-Mode": "live",
    },
  });
}
