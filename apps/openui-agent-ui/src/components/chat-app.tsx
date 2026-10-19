"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { OpenUIMessage } from "@/components/openui-message";
import { SUGGESTED_PROMPTS } from "@/lib/mock-responder";
import type { AppMode } from "@/lib/server-mode";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  isStreaming?: boolean;
};

type ChatAppProps = {
  initialMode: AppMode;
};

function newId() {
  return crypto.randomUUID();
}

export function ChatApp({ initialMode }: ChatAppProps) {
  const [mode, setMode] = useState<AppMode>(initialMode);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      const userMessage: ChatMessage = {
        id: newId(),
        role: "user",
        content: trimmed,
      };
      const assistantId = newId();
      const history = [...messages, userMessage];

      setMessages([
        ...history,
        { id: assistantId, role: "assistant", content: "", isStreaming: true },
      ]);
      setInput("");
      setIsSending(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const responseMode = res.headers.get("X-OpenUI-Mode");
        if (responseMode === "mock" || responseMode === "live") {
          setMode(responseMode);
        }

        if (!res.ok || !res.body) {
          throw new Error(`Chat failed (${res.status})`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulated, isStreaming: true }
                : m,
            ),
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m,
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Something went wrong";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `root = Card([err])\nerr = TextContent("Error: ${message.replace(/"/g, "'")}")`,
                  isStreaming: false,
                }
              : m,
          ),
        );
      } finally {
        setIsSending(false);
      }
    },
    [isSending, messages],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">
            OpenUI Agent UI
          </h1>
          <p className="text-xs text-muted-foreground">
            Agents answer with rendered UI (OpenUI Lang 1.0)
          </p>
        </div>
        <Badge variant={mode === "live" ? "default" : "secondary"}>
          {mode === "live" ? "Live" : "Mock"}
        </Badge>
      </header>

      <ScrollArea className="min-h-0 flex-1 px-4">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 py-4">
          {messages.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                No messages yet. Try a suggested prompt — mock mode works with
                no API key.
              </p>
            </div>
          ) : null}

          {messages.map((message) =>
            message.role === "user" ? (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                  {message.content}
                </div>
              </div>
            ) : (
              <OpenUIMessage
                key={message.id}
                response={message.content}
                isStreaming={Boolean(message.isStreaming)}
                onAssistantAction={(text) => sendMessage(text)}
              />
            ),
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="shrink-0 border-t bg-background px-4 py-3">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                variant="outline"
                size="sm"
                className="h-auto whitespace-normal text-left"
                disabled={isSending}
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
          <Separator />
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for weather, a table, a form…"
              disabled={isSending}
              aria-label="Message"
            />
            <Button type="submit" disabled={isSending || !input.trim()}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
