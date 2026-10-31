import { AbstractAgent, EventType } from "@ag-ui/client";
import type { BaseEvent, RunAgentInput } from "@ag-ui/core";
import { Observable } from "rxjs";
import { replyForUserMessage } from "./mock-intents";

const CHUNK_SIZE = 40;
const CHUNK_DELAY_MS = 30;

function lastUserMessage(input: RunAgentInput): string {
  const messages = input.messages ?? [];
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i];
    if (message?.role === "user" && typeof message.content === "string") {
      return message.content;
    }
  }
  return "";
}

function streamTextAsEvents(
  threadId: string,
  runId: string,
  text: string,
): BaseEvent[] {
  const messageId = crypto.randomUUID();
  const events: BaseEvent[] = [
    { type: EventType.RUN_STARTED, threadId, runId },
    { type: EventType.TEXT_MESSAGE_START, messageId, role: "assistant" },
  ];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    events.push({
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId,
      delta: text.slice(i, i + CHUNK_SIZE),
    });
  }
  events.push(
    { type: EventType.TEXT_MESSAGE_END, messageId },
    { type: EventType.RUN_FINISHED, threadId, runId },
  );
  return events;
}

export class MockCatalogAgent extends AbstractAgent {
  constructor() {
    super({ agentId: "default", description: "Scripted CopilotKit catalog demo agent" });
  }

  run(input: RunAgentInput): Observable<BaseEvent> {
    const threadId = input.threadId ?? crypto.randomUUID();
    const runId = input.runId ?? crypto.randomUUID();
    const reply = replyForUserMessage(lastUserMessage(input));
    const events = streamTextAsEvents(threadId, runId, reply);

    return new Observable((subscriber) => {
      let index = 0;
      const tick = () => {
        if (index >= events.length) {
          subscriber.complete();
          return;
        }
        const event = events[index];
        index += 1;
        subscriber.next(event);
        const delay =
          event.type === EventType.TEXT_MESSAGE_CONTENT ? CHUNK_DELAY_MS : 0;
        if (delay > 0) {
          setTimeout(tick, delay);
        } else {
          tick();
        }
      };
      tick();
      return () => {};
    });
  }
}

/** Exported for tests — same chunking as the agent. */
export function buildMockEventSequence(
  threadId: string,
  runId: string,
  userText: string,
): BaseEvent[] {
  return streamTextAsEvents(threadId, runId, replyForUserMessage(userText));
}
