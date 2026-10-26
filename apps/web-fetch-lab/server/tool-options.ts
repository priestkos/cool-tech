import type { CoreMessage } from "ai"
import { DEFAULT_MAX_LENGTH } from "./constants"

export type SafetyOptions = {
  allowedDomains?: string[]
  requireUrlInUserMessage?: boolean
  maxLength?: number
}

export type FetchRequestBody = {
  url: string
  offset?: number
  useFixtureTransport?: boolean
  userMessageText?: string
  safety?: SafetyOptions
}

export function parseAllowedDomains(input: string | undefined): string[] | undefined {
  if (!input?.trim()) {
    return undefined
  }
  const domains = input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
  return domains.length > 0 ? domains : undefined
}

export function buildUserMessages(text: string | undefined): CoreMessage[] {
  if (!text?.trim()) {
    return []
  }
  return [{ role: "user", content: text }]
}

export function resolveSafety(safety: SafetyOptions | undefined) {
  return {
    allowedDomains: safety?.allowedDomains,
    requireUrlInUserMessage: safety?.requireUrlInUserMessage ?? false,
    maxLength: safety?.maxLength ?? DEFAULT_MAX_LENGTH,
  }
}
