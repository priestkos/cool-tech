import { dirname, join } from "node:path"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

export function resolveOcrBinaryPath(): string {
  const pkgJson = require.resolve(
    `@alibaba-group/ocr-${process.platform}-${process.arch}/package.json`,
  )
  return join(dirname(pkgJson), "bin/opencodereview")
}

export function buildPreviewArgv(repoRoot: string): string[] {
  return [
    "review",
    "--repo",
    repoRoot,
    "--preview",
    "--format",
    "json",
    "--color",
    "never",
  ]
}

export function buildDelegateRuleArgv(repoRoot: string, relativePaths: string[]): string[] {
  return [
    "delegate",
    "rule",
    "--repo",
    repoRoot,
    "--format",
    "json",
    "--color",
    "never",
    ...relativePaths,
  ]
}

export function buildReviewArgv(repoRoot: string): string[] {
  return [
    "review",
    "--repo",
    repoRoot,
    "--format",
    "json",
    "--audience",
    "agent",
    "--max-tokens-budget",
    "60000",
    "--timeout",
    "3",
    "--effort",
    "low",
    "--color",
    "never",
  ]
}

export function buildOcrEnv(options: {
  homeDir: string
  realMode: boolean
}): Record<string, string> {
  const env: Record<string, string> = {
    PATH: process.env.PATH ?? "/usr/bin:/bin",
    HOME: options.homeDir,
    OCR_ENABLE_TELEMETRY: "false",
  }

  if (options.realMode) {
    const url = process.env.OCR_LLM_URL
    const token = process.env.OCR_LLM_TOKEN
    const model = process.env.OCR_LLM_MODEL
    if (url) env.OCR_LLM_URL = url
    if (token) env.OCR_LLM_TOKEN = token
    if (model) env.OCR_LLM_MODEL = model
    env.OCR_LLM_PROTOCOL = process.env.OCR_LLM_PROTOCOL ?? "openai"
  }

  return env
}

export function realModeAvailable(): boolean {
  return Boolean(
    process.env.OCR_LLM_URL &&
      process.env.OCR_LLM_TOKEN &&
      process.env.OCR_LLM_MODEL,
  )
}

export function getConfiguredModel(): string | undefined {
  return realModeAvailable() ? process.env.OCR_LLM_MODEL : undefined
}
