import { experimental_createWebFetchTool as createWebFetchTool } from "@ai-sdk/tool-web-fetch"
import { createFixtureAwareFetch } from "./fixture-fetch"
import {
  buildUserMessages,
  type FetchRequestBody,
  resolveSafety,
} from "./tool-options"

export type FetchApiResult = {
  rawHtml: string | null
  rawError?: string
  tool: Awaited<ReturnType<ReturnType<typeof createWebFetchTool>["execute"]>>
}

async function fetchRawHtml(url: string, useFixtureTransport: boolean): Promise<string> {
  const transport = createFixtureAwareFetch(useFixtureTransport)
  const response = await transport(url, { method: "GET" })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return await response.text()
}

export async function handleFetchRequest(body: FetchRequestBody): Promise<FetchApiResult> {
  const { url, offset = 0, useFixtureTransport = false, userMessageText, safety } = body
  const resolved = resolveSafety(safety)

  const webFetch = createWebFetchTool({
    allowedDomains: resolved.allowedDomains,
    requireUrlInUserMessage: resolved.requireUrlInUserMessage,
    maxLength: resolved.maxLength,
    fetch: createFixtureAwareFetch(useFixtureTransport),
  })

  const messages = buildUserMessages(userMessageText ?? url)

  const [rawResult, toolResult] = await Promise.allSettled([
    fetchRawHtml(url, useFixtureTransport),
    webFetch.execute!(
      { url, offset },
      { messages, toolCallId: "manual", abortSignal: AbortSignal.timeout(60_000) },
    ),
  ])

  return {
    rawHtml: rawResult.status === "fulfilled" ? rawResult.value : null,
    rawError:
      rawResult.status === "rejected"
        ? rawResult.reason instanceof Error
          ? rawResult.reason.message
          : String(rawResult.reason)
        : undefined,
    tool: toolResult.status === "fulfilled"
      ? toolResult.value
      : {
          type: "error",
          url,
          errorCode: "network_error",
          message:
            toolResult.reason instanceof Error
              ? toolResult.reason.message
              : String(toolResult.reason),
        },
  }
}
