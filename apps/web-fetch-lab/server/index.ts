import { injectionPageHtml } from "./fixtures"
import { handleFetchRequest } from "./fetch-handler"
import { handleChatRequest } from "./chat-handler"
import type { FetchRequestBody } from "./tool-options"

const port = Number(process.env.WEB_FETCH_LAB_API_PORT ?? "3921")

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  })
}

async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T
}

Bun.serve({
  port,
  async fetch(request) {
    const { pathname } = new URL(request.url)

    if (request.method === "GET" && pathname === "/api/health") {
      return json({ ok: true })
    }

    if (request.method === "GET" && pathname === "/api/config") {
      return json({ realModelAvailable: Boolean(process.env.OPENAI_API_KEY) })
    }

    if (request.method === "GET" && pathname === "/api/fixtures/injection") {
      return new Response(injectionPageHtml(), {
        headers: { "content-type": "text/html; charset=utf-8" },
      })
    }

    if (request.method === "POST" && pathname === "/api/fetch") {
      try {
        const body = await readJson<FetchRequestBody>(request)
        const result = await handleFetchRequest(body)
        return json(result)
      } catch (error) {
        return json(
          {
            error: error instanceof Error ? error.message : String(error),
          },
          400,
        )
      }
    }

    if (request.method === "POST" && pathname === "/api/chat") {
      try {
        const body = await readJson<{
          message: string
          injectionDemo?: boolean
          useRealModel?: boolean
          useFixtureTransport?: boolean
          safety?: FetchRequestBody["safety"]
        }>(request)
        const result = await handleChatRequest({
          message: body.message,
          injectionDemo: body.injectionDemo ?? false,
          useRealModel: body.useRealModel ?? false,
          useFixtureTransport: body.useFixtureTransport ?? false,
          safety: body.safety,
        })
        return json({
          ...result,
          realModelAvailable: Boolean(process.env.OPENAI_API_KEY),
        })
      } catch (error) {
        return json(
          {
            error: error instanceof Error ? error.message : String(error),
          },
          400,
        )
      }
    }

    return new Response("Not found", { status: 404 })
  },
})

console.log(`Web Fetch Lab API listening on http://localhost:${port}`)
