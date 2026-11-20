import type { IncomingMessage, ServerResponse } from "node:http"
import type { Connect } from "vite"
import { sessionManager } from "./session-manager"

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader("Content-Type", "application/json; charset=utf-8")
  res.setHeader("Cache-Control", "no-store")
  res.end(JSON.stringify(data))
}

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(chunk as Buffer)
  }
  const raw = Buffer.concat(chunks).toString("utf8")
  if (!raw) return {}
  return JSON.parse(raw) as Record<string, unknown>
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

export function createRelayLabApiMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = req.url ?? ""
    if (!url.startsWith("/api/lab")) {
      next()
      return
    }

    try {
      if (req.method === "GET" && url === "/api/lab/state") {
        sendJson(res, 200, { ok: true, ...sessionManager.snapshot() })
        return
      }

      if (req.method === "GET" && url === "/api/lab/frame.png") {
        const bytes = await sessionManager.screenshotBytes()
        if (!bytes) {
          sendJson(res, 503, { ok: false, message: "Not connected" })
          return
        }
        res.statusCode = 200
        res.setHeader("Content-Type", "image/png")
        res.setHeader("Cache-Control", "no-store")
        res.end(Buffer.from(bytes))
        return
      }

      if (req.method === "POST" && url === "/api/lab/connect") {
        const body = await readJsonBody(req)
        if (body.forceMock === true) {
          await sessionManager.forceMockConnect()
        } else {
          await sessionManager.tryConnect()
        }
        sendJson(res, 200, { ok: true, ...sessionManager.snapshot() })
        return
      }

      if (req.method === "POST" && url === "/api/lab/disconnect") {
        sendJson(res, 200, { ok: true, ...sessionManager.disconnect() })
        return
      }

      if (req.method === "POST" && url === "/api/lab/control/panel") {
        sendJson(res, 200, { ok: true, ...sessionManager.claimPanelControl() })
        return
      }

      if (req.method === "POST" && url === "/api/lab/control/release") {
        sendJson(res, 200, { ok: true, ...sessionManager.releaseControl() })
        return
      }

      if (req.method === "POST" && url === "/api/lab/viewer-mode") {
        const body = await readJsonBody(req)
        const mode = body.mode === "take-control" ? "take-control" : "view-only"
        const snap = sessionManager.setViewerMode(mode)
        sendJson(res, 200, { ok: true, ...snap })
        return
      }

      if (req.method === "POST" && url === "/api/lab/viewer/click") {
        if (!sessionManager.viewerAllowsInput()) {
          sendJson(res, 403, { ok: false, message: "View-only — no input sent" })
          return
        }
        const body = await readJsonBody(req)
        const x = typeof body.x === "number" ? body.x : 0.5
        const y = typeof body.y === "number" ? body.y : 0.5
        const client = sessionManager.client()
        if (!client) {
          sendJson(res, 503, { ok: false, message: "Not connected" })
          return
        }
        await client.click(x, y)
        sendJson(res, 200, { ok: true, ...sessionManager.snapshot() })
        return
      }

      if (req.method === "GET" && url === "/api/lab/doctor") {
        sendJson(res, 200, { ok: true, ...(await sessionManager.refreshDoctor()) })
        return
      }

      if (req.method === "POST" && url === "/api/lab/agent-loop") {
        const snap = await sessionManager.runAgentLoop()
        sendJson(res, 200, { ok: true, ...snap })
        return
      }

      if (req.method === "POST" && url === "/api/lab/refresh") {
        sendJson(res, 200, { ok: true, ...(await sessionManager.refreshStatus()) })
        return
      }

      sendJson(res, 404, { ok: false, message: "Unknown lab route" })
    } catch (error) {
      sendJson(res, 400, { ok: false, message: errorMessage(error) })
    }
  }
}