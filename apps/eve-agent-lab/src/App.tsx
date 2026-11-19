import { useCallback, useEffect, useMemo, useState } from "react";
import { openInteractions } from "eve/events";
import { useEveAgent } from "eve/react";
import type { ClientSessionState, SessionStreamEvent } from "eve/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

type TreeNode = {
  name: string;
  path: string;
  kind: "file" | "directory";
  children?: TreeNode[];
};

type TracePayload = {
  spans: {
    spans: Array<{
      name: string;
      traceId: string;
      spanId: string;
      parentSpanId?: string;
      attributes?: Record<string, unknown>;
    }>;
  };
  steps: { entries: Array<{ step: string; at: string; replayed: boolean }> };
};

const STORAGE_KEY = "eve-agent-lab-session-v1";

function loadSavedSession(): { events: SessionStreamEvent[]; session: ClientSessionState | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { events: [], session: null };
    return JSON.parse(raw) as { events: SessionStreamEvent[]; session: ClientSessionState | null };
  } catch {
    return { events: [], session: null };
  }
}

function timelineFromEvents(events: readonly SessionStreamEvent[]) {
  return events
    .filter((event) => event.type === "call.settled" || event.type === "call.started")
    .map((event, index) => ({
      id: `${event.type}-${index}`,
      type: event.type,
      payload: event,
    }));
}

export default function App() {
  const saved = useMemo(() => loadSavedSession(), []);
  const [instructions, setInstructions] = useState("");
  const [instructionsDirty, setInstructionsDirty] = useState(false);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [selectedPath, setSelectedPath] = useState("instructions.md");
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("Look up order ORD-1234 and start a refund.");
  const [traces, setTraces] = useState<TracePayload | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [useMock, setUseMock] = useState(true);
  const [labStatus, setLabStatus] = useState<string | null>(null);

  const agent = useEveAgent({
    initialEvents: saved.events,
    initialSession: saved.session ?? undefined,
    resume: saved.session != null,
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ events: agent.events, session: agent.session }),
    );
  }, [agent.events, agent.session]);

  const pending = openInteractions(agent.view).filter(
    (item) => item.request.kind !== "sign-in" && item.answer === undefined,
  );

  const refreshTree = useCallback(async () => {
    const response = await fetch("/lab/api/agent-tree");
    const json = (await response.json()) as { tree: TreeNode[] };
    setTree(json.tree);
  }, []);

  const refreshFile = useCallback(async (path: string) => {
    const response = await fetch(`/lab/api/agent-file?path=${encodeURIComponent(path)}`);
    const json = (await response.json()) as { content: string };
    setDraft(json.content);
    if (path === "instructions.md") {
      setInstructions(json.content);
      setInstructionsDirty(false);
    }
  }, []);

  const refreshTraces = useCallback(async () => {
    const response = await fetch("/lab/api/traces");
    setTraces((await response.json()) as TracePayload);
  }, []);

  useEffect(() => {
    void refreshTree();
    void refreshFile("instructions.md");
    void refreshTraces();
    const interval = window.setInterval(() => void refreshTraces(), 2000);
    return () => window.clearInterval(interval);
  }, [refreshTree, refreshFile, refreshTraces]);

  const saveInstructions = async () => {
    await fetch("/lab/api/agent-file", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: selectedPath, content: draft }),
    });
    if (selectedPath === "instructions.md") {
      setInstructions(draft);
      setInstructionsDirty(false);
    }
    setLabStatus(`Saved ${selectedPath}. Next chat turn uses the updated instructions when eve reloads agent files.`);
  };

  const sendMessage = async () => {
    const trimmed = message.trim();
    if (!trimmed || agent.status === "resuming") return;
    await agent.send(trimmed);
    setMessage("");
    void refreshTraces();
  };

  const respond = async (interactionId: string, optionId: "approve" | "deny") => {
    await agent.respond([{ interactionId, optionId }]);
    void refreshTraces();
  };

  const simulateCrash = async () => {
    const response = await fetch("/lab/api/simulate-crash", { method: "POST" });
    const json = (await response.json()) as { detail: string };
    setLabStatus(json.detail);
  };

  const resetSteps = async () => {
    await fetch("/lab/api/reset-steps", { method: "POST" });
    void refreshTraces();
  };

  const applyRuntime = async () => {
    await fetch("/lab/api/runtime", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ useMock, apiKey: apiKey.trim() || undefined }),
    });
    setLabStatus("Runtime config saved under .eve/ (never committed). Simulate crash to reload eve dev.");
  };

  const timeline = timelineFromEvents(agent.events);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Eve Agent Lab</h1>
            <p className="text-xs text-muted-foreground">
              Real <code className="text-foreground">eve@1.0.0</code> · mock model default · Node 24+
            </p>
          </div>
          <MainBadge status={agent.status} />
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-3" aria-label="Agent folder">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Agent folder</CardTitle>
              <CardDescription>Filesystem authoring surface for eve.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <AgentTree
                nodes={tree}
                selected={selectedPath}
                onSelect={(path) => {
                  setSelectedPath(path);
                  void refreshFile(path);
                }}
              />
              <Label htmlFor="editor">Edit {selectedPath}</Label>
              <Textarea
                id="editor"
                className="min-h-40 font-mono text-xs"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (selectedPath === "instructions.md") setInstructionsDirty(true);
                }}
              />
              <Button type="button" onClick={() => void saveInstructions()}>
                Save file
              </Button>
              {instructionsDirty ? (
                <p className="text-xs text-amber-700 dark:text-amber-300">Instructions changed — save before the next run.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Runtime model</CardTitle>
              <CardDescription>Optional real key (never committed).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={useMock}
                  onChange={(e) => setUseMock(e.target.checked)}
                />
                Use offline mock model (default)
              </label>
              <Input
                type="password"
                placeholder="AI Gateway / provider key (optional)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoComplete="off"
              />
              <Button type="button" variant="outline" onClick={() => void applyRuntime()}>
                Save runtime config
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 lg:col-span-5" aria-label="Chat">
          <Card className="min-h-[32rem]">
            <CardHeader>
              <CardTitle className="text-sm">Chat</CardTitle>
              <CardDescription>
                {instructions.includes("fictional") ? "Fixture instructions loaded." : "Custom instructions active."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-[28rem] flex-col gap-3">
              <div className="flex-1 space-y-2 overflow-y-auto rounded-md border border-border p-3 text-sm">
                {agent.messages.map((item) => (
                  <article key={item.id} className="space-y-1">
                    <Badge variant="outline">{item.role}</Badge>
                    {item.parts.map((part, index) =>
                      part.type === "text" ? (
                        <p key={part.id ?? index} className="whitespace-pre-wrap">
                          {part.text}
                        </p>
                      ) : null,
                    )}
                  </article>
                ))}
              </div>

              {pending.map(({ interactionId, request }) => (
                <div key={interactionId} className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                  <p className="font-medium">Approval required</p>
                  <p className="text-muted-foreground">{request.prompt}</p>
                  <div className="mt-2 flex gap-2">
                    <Button type="button" onClick={() => void respond(interactionId, "approve")}>
                      Approve
                    </Button>
                    <Button type="button" variant="destructive" onClick={() => void respond(interactionId, "deny")}>
                      Deny
                    </Button>
                  </div>
                </div>
              ))}

              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  void sendMessage();
                }}
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={agent.status === "resuming"}
                  aria-label="Chat message"
                />
                <Button type="submit" disabled={agent.status === "resuming"}>
                  Send
                </Button>
              </form>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => void agent.newSession()}>
                  New session
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await fetch("/lab/api/reset-steps", { method: "POST" });
                    setMessage("Run the durable pipeline crash demo");
                  }}
                >
                  Crash demo preset
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => void simulateCrash()}>
                  Simulate crash
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => void resetSteps()}>
                  Reset step log
                </Button>
              </div>

              {labStatus ? <p className="text-xs text-muted-foreground">{labStatus}</p> : null}
              {agent.error ? <p className="text-xs text-destructive">{agent.error.message}</p> : null}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 lg:col-span-4" aria-label="Observability">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Tool-call timeline</CardTitle>
              <CardDescription>Stream events from the live eve session.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-56 space-y-2 overflow-y-auto text-xs">
              {timeline.length === 0 ? <p className="text-muted-foreground">No tool activity yet.</p> : null}
              {timeline.map((item) => (
                <div key={item.id} className="rounded border border-border p-2 font-mono">
                  <div className="font-medium">{item.type}</div>
                  <pre className="whitespace-pre-wrap break-all text-[10px] text-muted-foreground">
                    {JSON.stringify(item.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Trace panel</CardTitle>
              <CardDescription>In-memory OTel spans flushed to <code>.eve/lab-spans.json</code>.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-56 space-y-2 overflow-y-auto text-xs">
              {(traces?.spans.spans ?? []).map((span) => (
                <div key={`${span.traceId}-${span.spanId}`} className="rounded border border-border p-2">
                  <div className="font-medium">{span.name}</div>
                  <div className="text-muted-foreground">trace {span.traceId.slice(0, 8)} · span {span.spanId.slice(0, 8)}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Workflow steps</CardTitle>
              <CardDescription>Checkpoint log for crash/resume (skipped replays stay absent).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              {(traces?.steps.entries ?? []).map((entry) => (
                <div key={`${entry.step}-${entry.at}`} className="flex items-center justify-between rounded border border-border px-2 py-1">
                  <span>{entry.step}</span>
                  <Badge variant={entry.replayed ? "secondary" : "outline"}>
                    {entry.replayed ? "after resume" : "first run"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <AboutCard />
        </section>
      </main>
    </div>
  );
}

function MainBadge({ status }: { status: string }) {
  return <Badge variant="outline">Agent {status}</Badge>;
}

function AgentTree({
  nodes,
  selected,
  onSelect,
  depth = 0,
}: {
  nodes: TreeNode[];
  selected: string;
  onSelect: (path: string) => void;
  depth?: number;
}) {
  return (
    <ul className="space-y-1 text-xs" style={{ paddingLeft: depth * 8 }}>
      {nodes.map((node) => (
        <li key={node.path}>
          {node.kind === "file" ? (
            <button
              type="button"
              className={`w-full rounded px-1 py-0.5 text-left hover:bg-muted ${selected === node.path ? "bg-muted font-medium" : ""}`}
              onClick={() => onSelect(node.path)}
            >
              {node.name}
            </button>
          ) : (
            <>
              <div className="px-1 py-0.5 font-medium text-muted-foreground">{node.name}/</div>
              {node.children ? <AgentTree nodes={node.children} selected={selected} onSelect={onSelect} depth={depth + 1} /> : null}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

function AboutCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">About</CardTitle>
        <CardDescription>Independent demo · not affiliated with Vercel.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-xs text-muted-foreground">
        <p>
          <a className="text-primary underline" href="https://eve.dev" rel="noreferrer" target="_blank">
            eve.dev
          </a>{" "}
          ·{" "}
          <a className="text-primary underline" href="https://github.com/vercel/eve" rel="noreferrer" target="_blank">
            vercel/eve
          </a>
        </p>
        <p>Pinned <code>eve@1.0.0</code> (Apache-2.0) and <code>ai@7.0.172</code>.</p>
      </CardContent>
    </Card>
  );
}