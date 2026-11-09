import { describe, expect, test } from "bun:test"
import { EXAMPLE_RUN_ALPHA, EXAMPLE_RUN_BETA } from "../fixtures/load-examples"
import { parseDroppedFiles } from "./parse-artifacts"
import { diffRuns } from "./run-diff"
import { validateCoverageLedgerDocument, validateFindingsDocument } from "./upstream-validation.server"

describe("upstream validation", () => {
  test("accepts example alpha fixtures", () => {
    expect(validateFindingsDocument(EXAMPLE_RUN_ALPHA.findings)).toEqual([])
    expect(validateCoverageLedgerDocument(EXAMPLE_RUN_ALPHA.ledger)).toEqual([])
  })

  test("rejects invalid findings shape", () => {
    const errors = validateFindingsDocument([{ verdict: "confirmed", title: "incomplete" }])
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe("status tab filtering", () => {
  test("partitions findings by verdict", () => {
    const confirmed = EXAMPLE_RUN_ALPHA.findings.filter((f) => f.verdict === "confirmed")
    const needs = EXAMPLE_RUN_ALPHA.findings.filter((f) => f.verdict === "needs_validation")
    const rejected = EXAMPLE_RUN_ALPHA.findings.filter((f) => f.verdict === "rejected")
    expect(confirmed).toHaveLength(1)
    expect(needs).toHaveLength(1)
    expect(rejected).toHaveLength(1)
  })
})

describe("coverage heatmap mapping", () => {
  test("maps ledger units with statuses", () => {
    const statuses = new Set(EXAMPLE_RUN_ALPHA.ledger.map((u) => u.status))
    expect(statuses.has("covered")).toBe(true)
    expect(statuses.has("planned")).toBe(true)
  })
})

describe("run diff", () => {
  test("detects added/changed findings between example runs", () => {
    const diffs = diffRuns(EXAMPLE_RUN_ALPHA, EXAMPLE_RUN_BETA)
    const kinds = new Set(diffs.map((d) => d.kind))
    expect(kinds.has("added")).toBe(true)
    expect(kinds.has("changed")).toBe(true)
  })
})

describe("drop-file parse errors", () => {
  test("surfaces JSON parse failures", () => {
    const result = parseDroppedFiles({ findingsJson: "not-json" })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.message).toContain("valid JSON")
    }
  })

  test("validation rejects dropped invalid findings", () => {
    const result = parseDroppedFiles({ findingsJson: "[{\"verdict\":\"rejected\"}]" })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(validateFindingsDocument(result.findings).length).toBeGreaterThan(0)
    }
  })
})
