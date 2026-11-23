import { createHash } from "node:crypto"
import { describe, expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { play } from "./components/dissolve/engine"
import { removeInboxItem, restoreInboxItem, INITIAL_INBOX } from "./features/archive"

const PINNED = join(import.meta.dir, "../node_modules/dissolve-ui/registry/web")

const FILES = [
  "engine.ts",
  "scratch-card.tsx",
  "toast.tsx",
  "swipe-to-delete.tsx",
  "glossy-button.tsx",
  "like-button.tsx",
] as const

function sha256(path: string) {
  return createHash("sha256").update(readFileSync(path)).digest("hex")
}

describe("dissolve-ui@0.0.6 registry/web", () => {
  test("copied component files match tarball registry bytes", () => {
    for (const file of FILES) {
      const local = join(import.meta.dir, "components/dissolve", file)
      const upstream = join(PINNED, file)
      expect(sha256(local)).toBe(sha256(upstream))
    }
  })

  test("engine exports play()", () => {
    expect(typeof play).toBe("function")
  })
})

describe("toast undo archive helpers", () => {
  test("remove and restore inbox row", () => {
    const first = INITIAL_INBOX[0]!
    const trimmed = removeInboxItem(INITIAL_INBOX, first.id)
    expect(trimmed).toHaveLength(INITIAL_INBOX.length - 1)
    const back = restoreInboxItem(trimmed, first)
    expect(back.some((i) => i.id === first.id)).toBe(true)
  })
})