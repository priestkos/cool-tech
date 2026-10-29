import { analyzeInput, getStatus, reviewInput, WorkspaceError } from "./ocr-runner.ts"

const port = Number(process.env.OCR_PLAYGROUND_API_PORT ?? "3955")
const MAX_DIFF_BYTES = 100 * 1024

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

function handleWorkspaceError(err: unknown) {
  if (err instanceof WorkspaceError) {
    return json({ error: err.message }, err.status)
  }
  console.error(err)
  return json({ error: "Internal server error" }, 500)
}

Bun.serve({
  hostname: "127.0.0.1",
  port,
  async fetch(req) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const url = new URL(req.url)

    if (url.pathname === "/api/status" && req.method === "GET") {
      return json(await getStatus())
    }

    if (url.pathname === "/api/analyze" && req.method === "POST") {
      let body: { sampleId?: string; diff?: string }
      try {
        body = await req.json()
      } catch {
        return json({ error: "Invalid JSON body" }, 400)
      }

      if (body.diff) {
        const bytes = new TextEncoder().encode(body.diff).byteLength
        if (bytes > MAX_DIFF_BYTES) {
          return json({ error: "Diff exceeds 100 KB limit" }, 413)
        }
      }

      if (!body.sampleId && !body.diff) {
        return json({ error: "sampleId or diff is required" }, 400)
      }

      try {
        return json(await analyzeInput(body))
      } catch (err) {
        return handleWorkspaceError(err)
      }
    }

    if (url.pathname === "/api/review" && req.method === "POST") {
      let body: { sampleId?: string; diff?: string }
      try {
        body = await req.json()
      } catch {
        return json({ error: "Invalid JSON body" }, 400)
      }

      if (body.diff) {
        const bytes = new TextEncoder().encode(body.diff).byteLength
        if (bytes > MAX_DIFF_BYTES) {
          return json({ error: "Diff exceeds 100 KB limit" }, 413)
        }
      }

      if (!body.sampleId && !body.diff) {
        return json({ error: "sampleId or diff is required" }, 400)
      }

      try {
        return json(await reviewInput(body))
      } catch (err) {
        return handleWorkspaceError(err)
      }
    }

    return json({ error: "Not found" }, 404)
  },
})

console.log(`[open-code-review-playground] API on http://127.0.0.1:${port}`)
