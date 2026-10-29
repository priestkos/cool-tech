import { mkdir, mkdtemp, rm, unlink, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { tmpdir } from "node:os"
import { parsePatch } from "diff"

type ParsedDiff = NonNullable<ReturnType<typeof parsePatch>>[number]
import { getSample, type SampleDefinition } from "../src/lib/samples.ts"

const GIT_USER = ["-c", "user.name=ocr-playground", "-c", "user.email=playground@local", "-c", "commit.gpgsign=false"]

export type WorkspaceContext = {
  repoRoot: string
  homeDir: string
  unifiedDiff: string
  patchFiles: ParsedDiff[]
}

async function runGit(cwd: string, args: string[]): Promise<{ code: number; stderr: string }> {
  const proc = Bun.spawn(["git", ...GIT_USER, ...args], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: { PATH: process.env.PATH ?? "/usr/bin:/bin", HOME: process.env.HOME ?? tmpdir() },
  })
  const stderr = await new Response(proc.stderr).text()
  const code = await proc.exited
  return { code, stderr }
}

async function ensureParent(dir: string, filePath: string) {
  const parent = join(dir, ...filePath.split("/").slice(0, -1))
  if (parent !== dir) await mkdir(parent, { recursive: true })
}

function normalizePatchPaths(patch: ParsedDiff): ParsedDiff {
  const oldPath = patch.oldFileName?.replace(/^a\//, "") ?? patch.newFileName?.replace(/^b\//, "") ?? "file"
  return { ...patch, oldFileName: `a/${oldPath}`, newFileName: `b/${oldPath}` }
}

export function buildPreImageFromHunks(patch: ParsedDiff): string {
  let maxOldLine = 0
  for (const hunk of patch.hunks ?? []) {
    maxOldLine = Math.max(maxOldLine, hunk.oldStart + hunk.oldLines - 1)
  }
  const lines = Array.from({ length: maxOldLine }, () => "")
  for (const hunk of patch.hunks ?? []) {
    let oldLine = hunk.oldStart - 1
    for (const line of hunk.lines) {
      const prefix = line[0]
      const content = line.slice(1)
      if (prefix === " " || prefix === "-") {
        lines[oldLine] = content
        oldLine += 1
      }
    }
  }
  return lines.join("\n") + (lines.length ? "\n" : "")
}

async function readGitDiff(repoRoot: string): Promise<string> {
  const proc = Bun.spawn(["git", ...GIT_USER, "diff", "--no-color"], {
    cwd: repoRoot,
    stdout: "pipe",
    stderr: "pipe",
  })
  return await new Response(proc.stdout).text()
}

export async function withSampleWorkspace<T>(
  sampleId: string,
  fn: (ctx: WorkspaceContext) => Promise<T>,
): Promise<T> {
  const sample = getSample(sampleId)
  if (!sample) throw new WorkspaceError("Unknown sample", 400)

  const repoRoot = await mkdtemp(join(tmpdir(), "ocr-playground-"))
  const homeDir = await mkdtemp(join(tmpdir(), "ocr-home-"))

  try {
    await runGit(repoRoot, ["init", "-q"])
    for (const file of sample.files) {
      await ensureParent(repoRoot, file.path)
      await writeFile(join(repoRoot, file.path), file.before, "utf8")
      await runGit(repoRoot, ["add", file.path])
    }
    await runGit(repoRoot, ["commit", "-q", "-m", "before"])

    for (const file of sample.files) {
      await writeFile(join(repoRoot, file.path), file.after, "utf8")
    }

    const unifiedDiff = await readGitDiff(repoRoot)
    const patchFiles = parsePatch(unifiedDiff) ?? []

    return await fn({ repoRoot, homeDir, unifiedDiff, patchFiles })
  } finally {
    await rm(repoRoot, { recursive: true, force: true })
    await rm(homeDir, { recursive: true, force: true })
  }
}

export async function withPastedDiffWorkspace<T>(
  diffText: string,
  fn: (ctx: WorkspaceContext) => Promise<T>,
): Promise<T> {
  const patches = (parsePatch(diffText) ?? []).map(normalizePatchPaths)
  if (patches.length === 0) {
    throw new WorkspaceError("Could not parse unified diff", 422)
  }
  if (patches.length > 10) {
    throw new WorkspaceError("Diff touches more than 10 files (max 10)", 413)
  }

  const repoRoot = await mkdtemp(join(tmpdir(), "ocr-playground-"))
  const homeDir = await mkdtemp(join(tmpdir(), "ocr-home-"))

  try {
    await runGit(repoRoot, ["init", "-q"])

    for (const patch of patches) {
      const rel = patch.newFileName?.replace(/^b\//, "") ?? patch.oldFileName?.replace(/^a\//, "")
      if (!rel || rel === "/dev/null") continue

      const isNew = patch.oldFileName?.includes("/dev/null") ?? false
      if (!isNew) {
        await ensureParent(repoRoot, rel)
        const pre = buildPreImageFromHunks(patch)
        await writeFile(join(repoRoot, rel), pre, "utf8")
        await runGit(repoRoot, ["add", rel])
      }
    }

    const staged = await runGit(repoRoot, ["diff", "--cached", "--quiet"])
    if (staged.code !== 0) {
      await runGit(repoRoot, ["commit", "-q", "-m", "pre-image"])
    } else {
      await runGit(repoRoot, ["commit", "-q", "--allow-empty", "-m", "pre-image"])
    }

    const patchPath = join(repoRoot, ".pasted.patch")
    await writeFile(patchPath, diffText, "utf8")
    const apply = await runGit(repoRoot, ["apply", "--whitespace=nowarn", patchPath])
    if (apply.code !== 0) {
      throw new WorkspaceError(
        `git apply failed: ${apply.stderr.trim() || "invalid patch"}`,
        422,
      )
    }
    await unlink(patchPath).catch(() => undefined)

    return await fn({ repoRoot, homeDir, unifiedDiff: diffText, patchFiles: patches })
  } finally {
    await rm(repoRoot, { recursive: true, force: true })
    await rm(homeDir, { recursive: true, force: true })
  }
}

export class WorkspaceError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function withWorkspace<T>(
  body: { sampleId?: string; diff?: string },
  fn: (ctx: WorkspaceContext & { sample?: SampleDefinition }) => Promise<T>,
): Promise<T> {
  if (body.sampleId) {
    const sample = getSample(body.sampleId)
    if (!sample) throw new WorkspaceError("Unknown sample", 400)
    return withSampleWorkspace(body.sampleId, (ctx) => fn({ ...ctx, sample }))
  }
  if (body.diff) {
    return withPastedDiffWorkspace(body.diff, (ctx) => fn({ ...ctx }))
  }
  throw new WorkspaceError("sampleId or diff is required", 400)
}

export async function listReviewableRelativePaths(repoRoot: string): Promise<string[]> {
  const proc = Bun.spawn(["git", ...GIT_USER, "diff", "--name-only"], {
    cwd: repoRoot,
    stdout: "pipe",
  })
  const text = await new Response(proc.stdout).text()
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
}
