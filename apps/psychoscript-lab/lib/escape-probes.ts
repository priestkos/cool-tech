import type { EscapeProbeId } from "./types.ts"

export type EscapeProbe = {
  id: EscapeProbeId
  label: string
  code: string
}

export const ESCAPE_PROBES: EscapeProbe[] = [
  { id: "fetch", label: "fetch()", code: `return await fetch("https://example.com");` },
  { id: "require", label: "require()", code: `return require("fs");` },
  { id: "import", label: "import()", code: `return await import("node:fs");` },
  { id: "process", label: "process", code: `return typeof process !== "undefined" ? process.version : "no process";` },
  { id: "setTimeout", label: "setTimeout", code: `return new Promise((r) => setTimeout(() => r("fired"), 1));` },
  { id: "globalThis", label: "globalThis poke", code: `globalThis.__pwned = true; return globalThis.__pwned;` },
  {
    id: "eval",
    label: "Function / eval",
    code: `const F = Function("return 41+1"); return F();`,
  },
]