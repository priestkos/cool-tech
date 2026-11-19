import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const logPath = path.join(process.cwd(), ".eve", "lab-step-log.json");

export type StepLogEntry = {
  readonly step: string;
  readonly at: string;
  readonly replayed: boolean;
};

let replayMode = false;

export function beginStepLogSession(): void {
  replayMode = false;
  mkdirSync(path.dirname(logPath), { recursive: true });
  writeFileSync(logPath, JSON.stringify({ entries: [] satisfies StepLogEntry[] }, null, 2), "utf8");
}

export function markReplayMode(): void {
  replayMode = true;
}

export function recordWorkflowStep(step: string): StepLogEntry {
  const entry: StepLogEntry = {
    step,
    at: new Date().toISOString(),
    replayed: replayMode,
  };
  const current = readStepLog();
  current.entries.push(entry);
  mkdirSync(path.dirname(logPath), { recursive: true });
  writeFileSync(logPath, JSON.stringify(current, null, 2), "utf8");
  appendFileSync(`${logPath}.ndjson`, `${JSON.stringify(entry)}\n`, "utf8");
  return entry;
}

export function readStepLog(): { entries: StepLogEntry[] } {
  try {
    const raw = readFileSync(logPath, "utf8");
    const parsed = JSON.parse(raw) as { entries?: StepLogEntry[] };
    return { entries: parsed.entries ?? [] };
  } catch {
    return { entries: [] };
  }
}