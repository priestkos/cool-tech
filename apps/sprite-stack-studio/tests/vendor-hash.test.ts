import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { describe, expect, test } from "bun:test"

const PIN = "6fecdfd0d6e5a0595f979550e05f4b1fcde550fe"
const ROOT = path.join(import.meta.dir, "..", "vendor/danielwh2-sprite-stacking", PIN)

async function sha256(file: string) {
  const buf = await readFile(file)
  return createHash("sha256").update(buf).digest("hex")
}

describe("vendored sprite-stacking pin", () => {
  test("blob hashes match pin", async () => {
    expect(await sha256(path.join(ROOT, "skills/sprite-stacking/scripts/views_to_slices.py"))).toBe(
      "ad21a8b539a2a664f31cca23eba8c994aa09917d2d77ceb7d696f621b430a3cb",
    )
    expect(await sha256(path.join(ROOT, "skills/sprite-stacking/scripts/viewer.html"))).toBe(
      "b49824956ce0a6256ec129dc6b225d57d24e5ebe5fc9877b4f91cc3e55c8d551",
    )
    expect(await sha256(path.join(ROOT, "LICENSE"))).toBe(
      "f18804c99164e7b8d7210d5e2f0f86028be21dfdf861d9a3a763c54722e41893",
    )
    expect(await sha256(path.join(ROOT, "tests/check.py"))).toBe(
      "29562e2312fa3fc7c611e866ece1934fc6839e7e09aae8934097d073ccbba196",
    )
  })
})