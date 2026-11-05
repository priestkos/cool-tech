import { injectionPageHtml } from "./fixtures"
import { handleFetchRequest } from "./fetch-handler"
import { handleChatRequest } from "./chat-handler"
import { isChatRequest, isFetchRequest } from "./request-validation"

const port = Number(process.env.WEB_FETCH_LAB_API_PORT ?? "3921")

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  })
}

async function parseJson<T>(request: Request, validate: (value: unknown) => value is T): Promise<T | Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ error: "Invalid JSON" }, 400)
  }
  return validate(body) ? body : json({ error: "Invalid request body" }, 400)
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
        const body = await parseJson(request, isFetchRequest)
        if (body instanceof Response) return body
        const result = await handleFetchRequest(body)
        return json(result)
      } catch {
        console.error("Fetch request failed")
        return json({ error: "Unable to process request" }, 500)
      }
    }

    if (request.method === "POST" && pathname === "/api/chat") {
      try {
        const body = await parseJson(request, isChatRequest)
        if (body instanceof Response) return body
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
      } catch {
        console.error("Chat request failed")
        return json({ error: "Unable to process request" }, 500)
      }
    }

    return new Response("Not found", { status: 404 })
  },
})

console.log(`Web Fetch Lab API listening on http://localhost:${port}`)
