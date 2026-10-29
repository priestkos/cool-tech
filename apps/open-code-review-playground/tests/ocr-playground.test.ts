import { describe, expect, test } from "bun:test"
import { parsePatch } from "diff"
import {
  buildPreImageFromHunks,
  withPastedDiffWorkspace,
} from "../server/diff-repo.ts"
import {
  buildDelegateRuleArgv,
  buildOcrEnv,
  buildPreviewArgv,
  buildReviewArgv,
} from "../lib/ocr-cli.ts"

describe("buildPreImageFromHunks", () => {
  test("places old-side lines at correct line numbers", () => {
    const patch = parsePatch(
      [
        "diff --git a/src/a.ts b/src/a.ts",
        "--- a/src/a.ts",
        "+++ b/src/a.ts",
        "@@ -2,3 +2,4 @@",
        " line1",
        "-old2",
        "+new2",
        "+added",
        " tail",
      ].join("\n"),
    )[0]!
    const pre = buildPreImageFromHunks(patch)
    const lines = pre.replace(/\n$/, "").split("\n")
    expect(lines[1]).toBe("line1")
    expect(lines[2]).toBe("old2")
    expect(lines[3]).toBe("tail")
  })
})

describe("pasted diff repo builder", () => {
  test("git apply preserves new-side line numbers", async () => {
    const diff =
      "diff --git a/src/greet.ts b/src/greet.ts\n" +
      "index 850ea7a..dcb7b17 100644\n" +
      "--- a/src/greet.ts\n" +
      "+++ b/src/greet.ts\n" +
      "@@ -1,3 +1,3 @@\n" +
      " export function greet(name: string) {\n" +
      '-  return "Hello";\n' +
      '+  return "Hello, " + name;\n' +
      " }\n"
    await withPastedDiffWorkspace(diff, async (ctx) => {
      const content = await Bun.file(joinFile(ctx.repoRoot, "src/greet.ts")).text()
      const lines = content.replace(/\n$/, "").split("\n")
      expect(lines[1]).toBe('  return "Hello, " + name;')
    })
  })
})

function joinFile(root: string, rel: string) {
  return `${root}/${rel}`
}

describe("ocr argv/env builders", () => {
  test("argv never includes user-provided strings", () => {
    const repo = "/tmp/repo"
    const evil = "--evil;rm -rf /"
    const preview = buildPreviewArgv(repo)
    const delegate = buildDelegateRuleArgv(repo, [evil])
    const review = buildReviewArgv(repo)
    expect(preview).toEqual([
      "review",
      "--repo",
      repo,
      "--preview",
      "--format",
      "json",
      "--color",
      "never",
    ])
    expect(delegate.at(-1)).toBe(evil)
    expect(review).not.toContain(evil)
  })

  test("env only passes allowed keys", () => {
    process.env.ANTHROPIC_API_KEY = "secret"
    process.env.OPENAI_API_KEY = "secret"
    const env = buildOcrEnv({ homeDir: "/tmp/home", realMode: false })
    expect(Object.keys(env).sort()).toEqual(["HOME", "OCR_ENABLE_TELEMETRY", "PATH"])
    expect(env.ANTHROPIC_API_KEY).toBeUndefined()
    expect(env.OPENAI_API_KEY).toBeUndefined()
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.OPENAI_API_KEY
  })
})

describe("/api/analyze sample round trip", () => {
  test("returns at least one OCR rule group", async () => {
    const { analyzeInput } = await import("../server/ocr-runner.ts")
    const result = await analyzeInput({ sampleId: "sql-injection" })
    expect(result.ruleGroups.length).toBeGreaterThan(0)
    expect(result.preview.reviewable_count).toBeGreaterThan(0)
  })
})
