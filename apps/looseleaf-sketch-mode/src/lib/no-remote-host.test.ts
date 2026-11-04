import { describe, expect, test } from "bun:test"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const DIST = join(import.meta.dir, "../../dist")
const SKETCH_HTML = join(DIST, "sketch.html")

function walk(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...walk(full))
    else files.push(full)
  }
  return files
}

describe("Looseleaf runtime host guard", () => {
  test("sketch.html uses local Kevin Sans link", () => {
    const html = readFileSync(SKETCH_HTML, "utf8")
    expect(html).toContain('href="/fonts/kevin-sans.css"')
    expect(html).toContain("data-ll-fonts")
    expect(html).not.toContain("kevintngo.github.io")
  })

  test("built assets do not reference kevintngo.github.io", () => {
    const files = walk(DIST).filter(
      (f) => f.endsWith(".js") || f.endsWith(".css") || f.endsWith(".html"),
    )
    for (const file of files) {
      const text = readFileSync(file, "utf8")
      expect(text.includes("kevintngo.github.io")).toBe(false)
    }
  })
})
