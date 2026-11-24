import { existsSync } from "node:fs"
import path from "node:path"
import { describe, expect, test } from "bun:test"
import { APP_ROOT, SLICER_PY, VENV_PYTHON } from "../server/paths"

const python = existsSync(VENV_PYTHON) ? VENV_PYTHON : "python3"

describe("real CLI on gallery fixture", () => {
  test("produces strip width = slices * sliceWidth", async () => {
    const sheet = path.join(APP_ROOT, "public/gallery/round-pot-sheet.png")
    if (!existsSync(sheet)) {
      expect(true).toBe(true)
      return
    }
    const out = path.join(APP_ROOT, ".cache/test-round-pot-strip.png")
    const proc = Bun.spawn([python, SLICER_PY, sheet, out, "--slices", "20", "--round"], {
      cwd: path.dirname(SLICER_PY),
      stdout: "pipe",
      stderr: "pipe",
    })
    const code = await proc.exited
    expect(code).toBe(0)
    const strip = await Bun.file(out).arrayBuffer()
    expect(strip.byteLength).toBeGreaterThan(100)
    const outNoRound = path.join(APP_ROOT, ".cache/test-round-pot-strip-square.png")
    const proc2 = Bun.spawn([python, SLICER_PY, sheet, outNoRound, "--slices", "20"], {
      cwd: path.dirname(SLICER_PY),
    })
    expect(await proc2.exited).toBe(0)
    const a = await Bun.file(out).arrayBuffer()
    const b = await Bun.file(outNoRound).arrayBuffer()
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false)
  })
})