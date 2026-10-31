import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { catalogComponentCount } from "@/lib/catalog-schema";
import { useAgentMode } from "@/lib/agent-mode";

export function AppHeader() {
  const { theme, setTheme } = useTheme();
  const { mode, setMode, canUseReal, modelName, realModeAvailable } =
    useAgentMode();
  const count = catalogComponentCount();
  const isDark = theme === "dark";

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">
              CopilotKit Generative UI Catalog
            </h1>
            <Badge variant="outline">Experimental · A2UI 1.0 (candidate)</Badge>
            <Badge variant="secondary">{count} components (runtime count)</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Browse the standard catalog, chat with markdown A2UI fences, and fill page
            surfaces —{" "}
            <a
              className="underline"
              href="https://docs.copilotkit.ai/generative-ui/components"
              target="_blank"
              rel="noreferrer"
            >
              docs
            </a>
            ,{" "}
            <a
              className="underline"
              href="https://github.com/CopilotKit/CopilotKit/tree/v1.83.0"
              target="_blank"
              rel="noreferrer"
            >
              repo @ v1.83.0
            </a>
            ,{" "}
            <a
              className="underline"
              href="https://x.com/CopilotKit/status/2115499466182799400"
              target="_blank"
              rel="noreferrer"
            >
              launch post
            </a>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <span className="text-muted-foreground">Mode</span>
            <Badge variant={mode === "mock" ? "default" : "outline"}>MOCK</Badge>
            {canUseReal ? (
              <>
                <Switch
                  checked={mode === "real"}
                  onCheckedChange={(on: boolean) => setMode(on ? "real" : "mock")}
                  aria-label="Toggle real agent mode"
                />
                <Badge variant={mode === "real" ? "default" : "outline"}>
                  REAL
                </Badge>
              </>
            ) : (
              <Badge variant="outline">REAL unavailable</Badge>
            )}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {isDark ? "Light" : "Dark"}
          </Button>
        </div>
      </div>
      <div className="border-t bg-muted/30 px-4 py-2 text-muted-foreground text-xs">
        {mode === "mock" ? (
          <span>
            <strong className="text-foreground">Mock agent:</strong> scripted replies,
            no model. CopilotKit components and streaming are real.
          </span>
        ) : (
          <span>
            <strong className="text-foreground">Real mode:</strong> AG-UI endpoint with
            catalog context
            {modelName ? ` (${modelName})` : ""}.
            {realModeAvailable ? "" : " Server not configured."}
          </span>
        )}
      </div>
    </header>
  );
}
