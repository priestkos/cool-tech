import { mkdtemp, readFile, rm } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import type { AnalyzeResponse, ReviewResponse } from "../src/lib/api-types.ts"
import {
  buildDelegateRuleArgv,
  buildOcrEnv,
  buildPreviewArgv,
  buildReviewArgv,
  getConfiguredModel,
  realModeAvailable,
  resolveOcrBinaryPath,
} from "../lib/ocr-cli.ts"
import { enrichRuleGroups } from "../lib/rule-markdown.ts"
import type { SampleId } from "../src/lib/samples.ts"
import {
  listReviewableRelativePaths,
  withWorkspace,
  WorkspaceError,
  type WorkspaceContext,
} from "./diff-repo.ts"

const STDERR_CAP = 4 * 1024
const ANALYZE_TIMEOUT_MS = 20_000
const REVIEW_TIMEOUT_MS = 4 * 60_000

let reviewInFlight = false

async function spawnOcr(
  argv: string[],
  homeDir: string,
  realMode: boolean,
  timeoutMs: number,
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const binary = resolveOcrBinaryPath()
  const proc = Bun.spawn([binary, ...argv], {
    env: buildOcrEnv({ homeDir, realMode }),
    stdout: "pipe",
    stderr: "pipe",
  })

  const timer = setTimeout(() => proc.kill(), timeoutMs)
  const exitCode = await proc.exited
  clearTimeout(timer)

  let stderr = await new Response(proc.stderr).text()
  if (stderr.length > STDERR_CAP) {
    stderr = stderr.slice(0, STDERR_CAP) + "\n…(truncated)"
  }
  const stdout = await new Response(proc.stdout).text()
  return { stdout, stderr, exitCode }
}

async function runAnalyzeOnRepo(ctx: WorkspaceContext): Promise<AnalyzeResponse> {
  const previewResult = await spawnOcr(
    buildPreviewArgv(ctx.repoRoot),
    ctx.homeDir,
    false,
    ANALYZE_TIMEOUT_MS,
  )
  if (previewResult.exitCode !== 0) {
    throw new WorkspaceError(
      previewResult.stderr.trim() || "ocr preview failed",
      500,
    )
  }

  let preview: AnalyzeResponse["preview"]
  try {
    preview = JSON.parse(previewResult.stdout) as AnalyzeResponse["preview"]
  } catch {
    throw new WorkspaceError("Invalid JSON from ocr preview", 500)
  }

  const relPaths = await listReviewableRelativePaths(ctx.repoRoot)
  const delegateArgv = buildDelegateRuleArgv(ctx.repoRoot, relPaths)
  const delegateResult = await spawnOcr(delegateArgv, ctx.homeDir, false, ANALYZE_TIMEOUT_MS)

  if (delegateResult.exitCode !== 0) {
    throw new WorkspaceError(
      delegateResult.stderr.trim() || "ocr delegate rule failed",
      500,
    )
  }

  let delegateJson: { groups?: Parameters<typeof enrichRuleGroups>[0] }
  try {
    delegateJson = JSON.parse(delegateResult.stdout) as { groups?: Parameters<typeof enrichRuleGroups>[0] }
  } catch {
    throw new WorkspaceError("Invalid JSON from ocr delegate rule", 500)
  }

  return {
    unifiedDiff: ctx.unifiedDiff,
    preview,
    ruleGroups: enrichRuleGroups(delegateJson.groups ?? []),
  }
}

export async function analyzeInput(body: {
  sampleId?: string
  diff?: string
}): Promise<AnalyzeResponse> {
  return withWorkspace(body, async (ctx) => {
    const result = await runAnalyzeOnRepo(ctx)
    if (ctx.sample) {
      return { ...result, sampleId: ctx.sample.id }
    }
    return { ...result, pastedDiff: true }
  })
}

export async function getStatus() {
  const binary = resolveOcrBinaryPath()
  const homeDir = await mkdtemp(join(tmpdir(), "ocr-status-home-"))
  const versionProc = Bun.spawn([binary, "version"], {
    env: buildOcrEnv({ homeDir, realMode: false }),
    stdout: "pipe",
  })
  const ocrVersion = (await new Response(versionProc.stdout).text()).trim().split("\n")[0] ?? "unknown"
  await rm(homeDir, { recursive: true, force: true })

  const gitProc = Bun.spawn(["git", "--version"], { stdout: "pipe" })
  const gitVersion = (await new Response(gitProc.stdout).text()).trim()

  return {
    ocrVersion,
    gitVersion,
    realModeAvailable: realModeAvailable(),
    model: getConfiguredModel(),
  }
}

async function loadMockFixture(sampleId: SampleId): Promise<ReviewResponse> {
  const raw = await readFile(
    join(import.meta.dir, "..", "fixtures", `${sampleId}.review.json`),
    "utf8",
  )
  const parsed = JSON.parse(raw) as ReviewResponse
  return {
    ...parsed,
    mock: true,
    fixtureNote:
      "Sample output written for this demo, not a live OCR run",
  }
}

export async function reviewInput(body: {
  sampleId?: string
  diff?: string
}): Promise<ReviewResponse> {
  if (!realModeAvailable()) {
    if (body.sampleId) {
      return loadMockFixture(body.sampleId as SampleId)
    }
    throw new WorkspaceError(
      "No recorded review for pasted diffs in mock mode. Set OCR_LLM_URL, OCR_LLM_TOKEN, and OCR_LLM_MODEL for real reviews.",
      409,
    )
  }

  if (reviewInFlight) {
    throw new WorkspaceError("Another review is already running", 429)
  }

  reviewInFlight = true
  try {
    return await withWorkspace(body, async (ctx) => {
      const result = await spawnOcr(
        buildReviewArgv(ctx.repoRoot),
        ctx.homeDir,
        true,
        REVIEW_TIMEOUT_MS,
      )

      if (result.exitCode !== 0) {
        let message = result.stderr.trim() || "ocr review failed"
        try {
          const parsed = JSON.parse(result.stdout) as { message?: string }
          if (parsed.message) message = parsed.message
        } catch {
          /* keep stderr */
        }
        throw new WorkspaceError(message, 500)
      }

      try {
        return JSON.parse(result.stdout) as ReviewResponse
      } catch {
        throw new WorkspaceError("Invalid JSON from ocr review", 500)
      }
    })
  } finally {
    reviewInFlight = false
  }
}

export { WorkspaceError }
