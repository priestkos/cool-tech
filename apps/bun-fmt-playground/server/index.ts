import { withFormatSlot, getFmtStatus, runFormat } from "./format-runner.ts"
import type { FormatOptionsInput } from "../lib/flags.ts"

const port = Number(process.env.BUN_FMT_API_PORT ?? "3944")
const MAX_CODE_BYTES = 100 * 1024

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

Bun.serve({
  hostname: "127.0.0.1",
  port,
  async fetch(req) {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const url = new URL(req.url)

    if (url.pathname === "/api/status" && req.method === "GET") {
      const status = await getFmtStatus()
      return json(status)
    }

    if (url.pathname === "/api/format" && req.method === "POST") {
      const contentLength = req.headers.get("content-length")
      if (contentLength && Number.parseInt(contentLength, 10) > MAX_CODE_BYTES + 4096) {
        return json({ error: "Request body too large (max 100 KB of code)" }, 413)
      }

      let body: { language?: string; code?: string; options?: FormatOptionsInput }
      try {
        body = await req.json()
      } catch {
        return json({ error: "Invalid JSON body" }, 400)
      }

      const { language, code, options } = body
      if (typeof language !== "string" || typeof code !== "string") {
        return json({ error: "language and code are required strings" }, 400)
      }

      const codeBytes = new TextEncoder().encode(code).byteLength
      if (codeBytes > MAX_CODE_BYTES) {
        return json({ error: "Code exceeds 100 KB limit" }, 413)
      }

      const result = await withFormatSlot(() =>
        runFormat(language, code, options ?? {}),
      )

      if ("status" in result && "error" in result && !("formatted" in result)) {
        return json({ error: result.error }, result.status)
      }

      return json(result)
    }

    return json({ error: "Not found" }, 404)
  },
})

console.log(`[bun-fmt-playground] API on http://127.0.0.1:${port}`)
