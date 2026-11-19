import type { SessionStreamEvent } from "eve/client";

export function toolNameFromEvent(event: SessionStreamEvent): string | undefined {
  if (event.type !== "call.requested" && event.type !== "call.settled" && event.type !== "call.started") {
    return undefined;
  }
  const data = (event as { data?: { capability?: { name?: string } } }).data;
  return data?.capability?.name;
}

export function interactionIdFromOpened(event: SessionStreamEvent): string | undefined {
  if (event.type !== "interaction.opened") return undefined;
  const data = (event as { data?: { interactionId?: string } }).data;
  return data?.interactionId;
}