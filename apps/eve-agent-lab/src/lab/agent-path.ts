import path from "node:path";

export function resolveInsideAgentRoot(
  agentRoot: string,
  rel: string,
): { ok: true; target: string } | { ok: false; error: "Path escapes agent root." } {
  const root = path.resolve(agentRoot);
  const target = path.resolve(root, rel);
  if (!target.startsWith(root)) {
    return { ok: false, error: "Path escapes agent root." };
  }
  return { ok: true, target };
}
