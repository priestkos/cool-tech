import { useCallback } from "react";
import { CopilotChat } from "@copilotkit/react-core/v2";
import { useCopilotKit, useAgent } from "@copilotkit/react-core/v2/headless";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SUGGESTION_CHIPS } from "@/lib/mock-intents";
import { useAgentMode } from "@/lib/agent-mode";

export function ChatPanel() {
  const { mode } = useAgentMode();
  const { copilotkit } = useCopilotKit();
  const { agent } = useAgent();

  const sendPrompt = useCallback(
    async (prompt: string) => {
      agent.addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content: prompt,
      });
      await copilotkit.runAgent({ agent });
    },
    [agent, copilotkit],
  );

  return (
    <Card className="flex h-full min-h-[520px] flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Chat (markdown transport)</CardTitle>
        <p className="text-muted-foreground text-sm">
          Suggestion chips send scripted prompts in mock mode. Generated UI uses
          CopilotKit catalog components.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {SUGGESTION_CHIPS.map((chip) => (
            <Button
              key={chip.id}
              type="button"
              size="sm"
              variant="secondary"
              disabled={mode === "real"}
              title={
                mode === "real"
                  ? "Suggestion chips are disabled in real mode"
                  : chip.prompt
              }
              onClick={() => void sendPrompt(chip.prompt)}
            >
              {chip.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-hidden p-0">
        <div className="h-[440px] border-t">
          <CopilotChat className="h-full" />
        </div>
      </CardContent>
    </Card>
  );
}
