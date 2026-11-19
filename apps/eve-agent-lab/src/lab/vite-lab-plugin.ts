import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import type { Plugin, Connect } from "vite";
import type { ServerResponse } from "node:http";

const agentRoot = path.resolve(process.cwd(), "agent");

type TreeNode = {
  name: string;
  path: string;
  kind: "file" | "directory";
  children?: TreeNode[];
};

function buildTree(dir: string, base = agentRoot): TreeNode[] {
  const entries = readdirSync(dir).sort();
  const nodes: TreeNode[] = [];
  for (const name of entries) {
    const full = path.join(dir, name);
  const rel = path.relative(base, full);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      nodes.push({
        name,
        path: rel,
        kind: "directory",
        children: buildTree(full, base),
      });
    } else {
      nodes.push({ name, path: rel, kind: "file" });
    }
  }
  return nodes;
}

function readJsonBody(req: Connect.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw.length > 0 ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}

function killEveDevServer(): { killed: boolean; detail: string } {
  try {
    const output = execSync("ps -eo pid,cmd | grep -E 'eve dev' | grep -v grep || true", {
      encoding: "utf8",
    });
    const lines = output
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      return { killed: false, detail: "No eve dev process found (it may restart on the next chat request)." };
    }
    for (const line of lines) {
      const pid = Number.parseInt(line.split(/\s+/)[0] ?? "", 10);
      if (Number.isFinite(pid)) {
        try {
          process.kill(pid, "SIGKILL");
        } catch {
          // ignore individual pid failures
        }
      }
    }
    return { killed: true, detail: `Sent SIGKILL to ${lines.length} eve dev process(es). Vite will respawn on demand.` };
  } catch (error) {
    return { killed: false, detail: error instanceof Error ? error.message : "Unknown kill error" };
  }
}

export function eveAgentLabPlugin(): Plugin {
  return {
    name: "eve-agent-lab",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/lab/api/")) {
          next();
          return;
        }

        const url = new URL(req.url, "http://localhost");

        if (req.method === "GET" && url.pathname === "/lab/api/agent-tree") {
          sendJson(res, 200, { tree: buildTree(agentRoot) });
          return;
        }

        if (req.method === "GET" && url.pathname === "/lab/api/agent-file") {
          const rel = url.searchParams.get("path") ?? "instructions.md";
          const target = path.resolve(agentRoot, rel);
          if (!target.startsWith(agentRoot)) {
            sendJson(res, 403, { error: "Path escapes agent root." });
            return;
          }
          sendJson(res, 200, { path: rel, content: readFileSync(target, "utf8") });
          return;
        }

        if (req.method === "PUT" && url.pathname === "/lab/api/agent-file") {
          try {
            const body = (await readJsonBody(req)) as { path?: string; content?: string };
            const rel = body.path ?? "instructions.md";
            const content = body.content ?? "";
            const target = path.resolve(agentRoot, rel);
            if (!target.startsWith(agentRoot)) {
              sendJson(res, 403, { error: "Path escapes agent root." });
              return;
            }
            writeFileSync(target, content, "utf8");
            sendJson(res, 200, { ok: true, path: rel });
          } catch (error) {
            sendJson(res, 400, { error: error instanceof Error ? error.message : "Bad request" });
          }
          return;
        }

        if (req.method === "GET" && url.pathname === "/lab/api/traces") {
          const tracePath = path.join(process.cwd(), ".eve", "lab-spans.json");
          const stepPath = path.join(process.cwd(), ".eve", "lab-step-log.json");
          sendJson(res, 200, {
            spans: existsSync(tracePath) ? JSON.parse(readFileSync(tracePath, "utf8")) : { spans: [] },
            steps: existsSync(stepPath) ? JSON.parse(readFileSync(stepPath, "utf8")) : { entries: [] },
          });
          return;
        }

        if (req.method === "POST" && url.pathname === "/lab/api/reset-steps") {
          const stepPath = path.join(process.cwd(), ".eve", "lab-step-log.json");
          mkdirSync(path.dirname(stepPath), { recursive: true });
          writeFileSync(stepPath, JSON.stringify({ entries: [] }, null, 2), "utf8");
          sendJson(res, 200, { ok: true });
          return;
        }

        if (req.method === "POST" && url.pathname === "/lab/api/simulate-crash") {
          sendJson(res, 200, killEveDevServer());
          return;
        }

        if (req.method === "POST" && url.pathname === "/lab/api/runtime") {
          try {
            const body = (await readJsonBody(req)) as {
              useMock?: boolean;
              model?: string;
              apiKey?: string;
            };
            const runtimePath = path.join(process.cwd(), ".eve", "lab-runtime.json");
            mkdirSync(path.dirname(runtimePath), { recursive: true });
            writeFileSync(
              runtimePath,
              JSON.stringify(
                {
                  useMock: body.useMock !== false,
                  model: body.model ?? "openai/gpt-5.4-mini",
                  apiKey: body.apiKey ?? "",
                },
                null,
                2,
              ),
              "utf8",
            );
            sendJson(res, 200, { ok: true, note: "Restart eve dev (use Simulate crash) to pick up runtime model changes." });
          } catch (error) {
            sendJson(res, 400, { error: error instanceof Error ? error.message : "Bad request" });
          }
          return;
        }

        if (req.method === "GET" && url.pathname === "/lab/api/about") {
          sendJson(res, 200, {
            eve: "1.0.0",
            ai: "7.0.172",
            license: "Apache-2.0",
            nodeRequired: ">=24",
            eveDevUrl: process.env.EVE_BASE_URL ?? null,
          });
          return;
        }

        sendJson(res, 404, { error: "Not found" });
      });
    },
  };
}