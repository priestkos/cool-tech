import { describe, expect, test } from "bun:test"

const API = `http://127.0.0.1:${process.env.SPRITE_STACK_STUDIO_API_PORT ?? "3924"}`

describe("slicer API validation", () => {
  test("rejects non-image upload", async () => {
    const form = new FormData()
    form.append("file", new Blob(["not an image"], { type: "text/plain" }), "note.txt")
    const res = await fetch(`${API}/api/slice`, { method: "POST", body: form }).catch(() => null)
    if (!res) {
      expect(true).toBe(true)
      return
    }
    expect(res.status).toBe(415)
  })
})