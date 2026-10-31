import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AbstractAgent, HttpAgent } from "@ag-ui/client";
import { MockCatalogAgent } from "@/lib/mock-agent";

export type AgentMode = "mock" | "real";

interface AgentModeContextValue {
  mode: AgentMode;
  setMode: (mode: AgentMode) => void;
  realModeAvailable: boolean;
  modelName?: string;
  canUseReal: boolean;
}

const AgentModeContext = createContext<AgentModeContextValue | null>(null);

export function AgentModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AgentMode>("mock");
  const [realModeAvailable, setRealModeAvailable] = useState(false);
  const [modelName, setModelName] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { realModeAvailable?: boolean; model?: string } | null) => {
        if (cancelled || !data) return;
        setRealModeAvailable(Boolean(data.realModeAvailable));
        setModelName(data.model);
      })
      .catch(() => {
        /* mock-only: no API server */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      realModeAvailable,
      modelName,
      canUseReal: realModeAvailable,
    }),
    [mode, realModeAvailable, modelName],
  );

  return (
    <AgentModeContext.Provider value={value}>{children}</AgentModeContext.Provider>
  );
}

export function useAgentMode() {
  const ctx = useContext(AgentModeContext);
  if (!ctx) throw new Error("useAgentMode must be used within AgentModeProvider");
  return ctx;
}

export function createAgentForMode(mode: AgentMode): AbstractAgent {
  if (mode === "real") {
    return new HttpAgent({ url: "/api/agent", agentId: "default" });
  }
  return new MockCatalogAgent();
}
