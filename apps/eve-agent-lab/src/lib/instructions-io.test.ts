import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync } from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";

function writeInstructions(root: string, content: string) {
  const target = path.join(root, "agent", "instructions.md");
  writeFileSync(target, content, "utf8");
}

describe("instructions persistence", () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), "eve-lab-"));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  test("saved instructions are readable for the next run", () => {
    const agentDir = path.join(dir, "agent");
    mkdirSync(agentDir, { recursive: true });
    writeFileSync(path.join(agentDir, "instructions.md"), "alpha", "utf8");
    writeInstructions(dir, "beta instructions");
    const next = readFileSync(path.join(agentDir, "instructions.md"), "utf8");
    expect(next).toContain("beta");
  });
});