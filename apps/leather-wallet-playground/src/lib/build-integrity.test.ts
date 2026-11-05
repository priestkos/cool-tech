import { describe, expect, test } from "bun:test"
import { createHash } from "node:crypto"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const ROOT = join(import.meta.dir, "..")
const VENDOR_DOC = join(import.meta.dir, "../../scripts/vendor-wallet.md")
const WALLET_PATH = join(ROOT, "components/wallet.tsx")

function walk(dir: string): string[] {
  const entries = readdirSync(dir)
  const files: string[] = []
  for (const entry of entries) {
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) files.push(...walk(full))
    else files.push(full)
  }
  return files
}

/** Hostname literals with label boundaries (avoids bare substring matches on URLs). */
const FORBIDDEN_HOST_PATTERNS: { host: string; pattern: RegExp }[] = [
  {
    host: "assets.chanhdai.com",
    pattern: /(^|[^a-z0-9.-])assets\.chanhdai\.com(?![a-z0-9-])/i,
  },
  {
    host: "chanhdai.com",
    pattern: /(^|[^a-z0-9.-])chanhdai\.com(?![a-z0-9-])/i,
  },
]

function findForbiddenHostLiterals(text: string): string[] {
  const found: string[] = []
  for (const { host, pattern } of FORBIDDEN_HOST_PATTERNS) {
    pattern.lastIndex = 0
    if (pattern.test(text)) found.push(host)
  }
  return found
}

describe("build integrity", () => {
  test("vendored wallet sha256 matches vendor-wallet.md", () => {
    const doc = readFileSync(VENDOR_DOC, "utf8")
    const hash = createHash("sha256")
      .update(readFileSync(WALLET_PATH))
      .digest("hex")
    expect(doc).toContain(hash)
  })

  test("dist bundle does not reference chanhdai.com", () => {
    const distDir = join(import.meta.dir, "../../dist")
    let checked = false
    for (const file of walk(distDir)) {
      if (!file.endsWith(".js") && !file.endsWith(".css") && !file.endsWith(".html"))
        continue
      checked = true
      const text = readFileSync(file, "utf8")
      const forbidden = findForbiddenHostLiterals(text)
      expect(forbidden).toEqual([])
    }
    expect(checked).toBe(true)
  })
})
