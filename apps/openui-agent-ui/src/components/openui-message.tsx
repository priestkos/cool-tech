"use client";

import { Renderer } from "@openuidev/react-lang";
import { library } from "@/lib/openui";

type OpenUIMessageProps = {
  response: string;
  isStreaming: boolean;
  onAssistantAction?: (text: string) => void;
};

export function OpenUIMessage({
  response,
  isStreaming,
  onAssistantAction,
}: OpenUIMessageProps) {
  if (!response) {
    return null;
  }

  return (
    <div className="openui-message rounded-lg border bg-card text-card-foreground shadow-sm">
      <Renderer
        response={response}
        library={library}
        isStreaming={isStreaming}
        onAction={(event) => {
          if (event.type === "ToAssistant" && typeof event.params?.text === "string") {
            onAssistantAction?.(event.params.text);
            return;
          }
          if (event.type === "ToAssistant" && typeof event.params === "string") {
            onAssistantAction?.(event.params);
          }
        }}
      />
    </div>
  );
}
