import { describe, expect, test } from "bun:test";
import path from "node:path";
import { tmpdir } from "node:os";
import { resolveInsideAgentRoot } from "./agent-path";

describe("resolveInsideAgentRoot", () => {
  const root = path.join(tmpdir(), "eve-agent-lab-confinement");

  test("resolves relative files inside the root", () => {
    const instructions = resolveInsideAgentRoot(root, "instructions.md");
    expect(instructions.ok).toBe(true);
    if (instructions.ok) {
      expect(instructions.target.startsWith(path.resolve(root))).toBe(true);
      expect(instructions.target).toBe(path.resolve(root, "instructions.md"));
    }

    const tool = resolveInsideAgentRoot(root, "tools/lookup_order.ts");
    expect(tool.ok).toBe(true);
    if (tool.ok) {
      expect(tool.target.startsWith(path.resolve(root))).toBe(true);
      expect(tool.target).toBe(path.resolve(root, "tools/lookup_order.ts"));
    }
  });

  test("rejects a relative escape and an absolute path", () => {
    const passwd = resolveInsideAgentRoot(root, "../../etc/passwd");
    expect(passwd.ok).toBe(false);
    if (!passwd.ok) expect(passwd.error).toBe("Path escapes agent root.");

    const absolute = resolveInsideAgentRoot(root, "/etc/passwd");
    expect(absolute.ok).toBe(false);
    if (!absolute.ok) expect(absolute.error).toBe("Path escapes agent root.");
  });

  test("rejects a parent file when the parent path does not start with the root", () => {
    const parent = path.resolve(root, "..");
    expect(parent.startsWith(path.resolve(root))).toBe(false);
    const outside = resolveInsideAgentRoot(root, "../outside.txt");
    expect(outside.ok).toBe(false);
    if (!outside.ok) expect(outside.error).toBe("Path escapes agent root.");
  });

  test("allows a relative path that normalizes back inside", () => {
    const resolved = resolveInsideAgentRoot(root, "subdir/../instructions.md");
    expect(resolved.ok).toBe(true);
    if (resolved.ok) {
      expect(resolved.target.endsWith("instructions.md")).toBe(true);
      expect(resolved.target.startsWith(path.resolve(root))).toBe(true);
    }
  });
});
