import { useMemo } from "react";
import { ThemeProvider } from "next-themes";
import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";
import "@copilotkit/react-core/v2/styles.css";
import { AppHeader } from "@/components/app-header";
import { CatalogBrowser } from "@/components/catalog-browser";
import { ChatPanel } from "@/components/chat-panel";
import { PinnedPanel } from "@/components/pinned-panel";
import {
  GenuiErrorBanner,
  GenuiErrorProvider,
  useGenuiErrors,
} from "@/components/genui-error-banner";
import {
  AgentModeProvider,
  createAgentForMode,
  useAgentMode,
} from "@/lib/agent-mode";

function CopilotShell() {
  const { mode } = useAgentMode();
  const { report } = useGenuiErrors();
  const agent = useMemo(() => createAgentForMode(mode), [mode]);

  return (
    <CopilotKitProvider
      key={mode}
      selfManagedAgents={{ default: agent }}
      generativeUI={{
        ui: standardUI,
        transport: "markdown",
        theme: {
          "--a2ui-font-family": "ui-sans-serif, system-ui, sans-serif",
          dark: {
            "--a2ui-color-panel": "oklch(0.22 0 0)",
            "--a2ui-color-accent": "oklch(0.75 0.12 250)",
          },
        },
        errorBoundary: {
          onError: (info) => report(info),
        },
      }}
      enableInspector={false}
    >
      <div className="min-h-screen bg-background">
        <AppHeader />
        <GenuiErrorBanner />
        <main className="mx-auto grid max-w-6xl gap-4 px-4 py-4 lg:grid-cols-2">
          <CatalogBrowser />
          <div className="space-y-4">
            <ChatPanel />
            <PinnedPanel />
          </div>
        </main>
      </div>
    </CopilotKitProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AgentModeProvider>
        <GenuiErrorProvider>
          <CopilotShell />
        </GenuiErrorProvider>
      </AgentModeProvider>
    </ThemeProvider>
  );
}
