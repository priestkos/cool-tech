import { createContext, useContext, useState, type ReactNode } from "react";
import type { GenerativeUIErrorInfo } from "@copilotkit/react-core/v2/generative-ui";

interface GenuiErrorContextValue {
  lastError: GenerativeUIErrorInfo | null;
  report: (info: GenerativeUIErrorInfo) => void;
  clear: () => void;
}

const GenuiErrorContext = createContext<GenuiErrorContextValue | null>(null);

export function GenuiErrorProvider({ children }: { children: ReactNode }) {
  const [lastError, setLastError] = useState<GenerativeUIErrorInfo | null>(null);
  return (
    <GenuiErrorContext.Provider
      value={{
        lastError,
        report: setLastError,
        clear: () => setLastError(null),
      }}
    >
      {children}
    </GenuiErrorContext.Provider>
  );
}

export function useGenuiErrors() {
  const ctx = useContext(GenuiErrorContext);
  if (!ctx) throw new Error("useGenuiErrors must be used within GenuiErrorProvider");
  return ctx;
}

export function GenuiErrorBanner() {
  const { lastError, clear } = useGenuiErrors();
  if (!lastError) return null;
  return (
    <div
      role="alert"
      className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-950 dark:text-amber-100"
    >
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-3">
        <p>
          <span className="font-medium">Generative UI warning:</span>{" "}
          {lastError.error.message} ({lastError.kind})
        </p>
        <button
          type="button"
          className="shrink-0 underline"
          onClick={clear}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
