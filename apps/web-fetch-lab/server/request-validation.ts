import { experimental_createWebFetchTool as createWebFetchTool } from "@ai-sdk/tool-web-fetch"
import { InvalidArgumentError } from "ai"
import type { FetchRequestBody, SafetyOptions } from "./tool-options"

export type ChatRequestBody = {
  message: string
  injectionDemo?: boolean
  useRealModel?: boolean
  useFixtureTransport?: boolean
  safety?: SafetyOptions
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function optionalBoolean(value: unknown): boolean {
  return value === undefined || typeof value === "boolean"
}

function validSafety(value: unknown): boolean {
  if (value === undefined) return true
  if (!isObject(value) ||
    !(value.allowedDomains === undefined || (Array.isArray(value.allowedDomains) && value.allowedDomains.every((domain) => typeof domain === "string"))) ||
    !optionalBoolean(value.requireUrlInUserMessage) ||
    !(value.maxLength === undefined || (Number.isSafeInteger(value.maxLength) && (value.maxLength as number) > 0))) return false

  // Use the tool's own constructor to validate domain syntax, without executing it.
  try {
    createWebFetchTool({ allowedDomains: value.allowedDomains as string[] | undefined })
    return true
  } catch (error) {
    if (InvalidArgumentError.isInstance(error)) return false
    throw error
  }
}

function validUrl(value: unknown): boolean {
  if (typeof value !== "string" || !value.trim()) return false
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function isFetchRequest(value: unknown): value is FetchRequestBody {
  return isObject(value) && validUrl(value.url) &&
    (value.offset === undefined || (Number.isSafeInteger(value.offset) && (value.offset as number) >= 0)) &&
    optionalBoolean(value.useFixtureTransport) &&
    (value.userMessageText === undefined || typeof value.userMessageText === "string") &&
    validSafety(value.safety)
}

export function isChatRequest(value: unknown): value is ChatRequestBody {
  return isObject(value) && typeof value.message === "string" && value.message.trim().length > 0 &&
    optionalBoolean(value.injectionDemo) && optionalBoolean(value.useRealModel) &&
    optionalBoolean(value.useFixtureTransport) && validSafety(value.safety)
}
