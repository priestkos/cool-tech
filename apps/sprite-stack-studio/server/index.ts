import { readFile } from "node:fs/promises"
import path from "node:path"
import { MAX_UPLOAD_BYTES, type SlicerOptions } from "../src/constants"
import { GALLERY_DIR, GALLERY_JSON } from "./paths"
import { readJobFile, runSlicer } from "./slicer"

const port = Number(process.env.SPRITE_STACK_STUDIO_API_PORT ?? "3924")

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  })
}

const IMAGE_TYPES = new Set(["image/png", "image/webp"])

function parseOptions(form: FormData): SlicerOptions {
  const slicesRaw = form.get("slices")
  const coloursRaw = form.get("colours")
  let slices: number | null | undefined
  if (slicesRaw === null || slicesRaw === "") {
    slices = undefined
  } else {
    const n = Number(slicesRaw)
    slices = Number.isFinite(n) ? n : undefined
  }
  const colours = coloursRaw === null || coloursRaw === "" ? undefined : Number(coloursRaw)
  return {
    slices,
    round: form.get("round") === "true",
    colours: Number.isFinite(colours) ? colours : undefined,
    order: (form.get("order") as "auto" | "reading") || undefined,
    sideNose: (form.get("sideNose") as "left" | "right") || undefined,
    shade: form.get("shade") ? Number(form.get("shade")) : undefined,
    preview: form.get("preview") === "true",
    normals: form.get("normals") === "true",
    emissive: form.get("emissive") === "true",
  }
}

Bun.serve({
  port,
  async fetch(request) {
    const { pathname } = new URL(request.url)

    if (request.method === "GET" && pathname === "/api/health") {
      return json({ ok: true })
    }

    if (request.method === "GET" && pathname === "/gallery-data/manifest.json") {
      try {
        const body = await readFile(GALLERY_JSON, "utf-8")
        return new Response(body, { headers: { "content-type": "application/json" } })
      } catch {
        return json({ items: [] })
      }
    }

    if (request.method === "GET" && pathname.startsWith("/gallery-data/assets/")) {
      const rel = pathname.slice("/gallery-data/assets/".length)
      const filePath = path.join(GALLERY_DIR, rel)
      if (!filePath.startsWith(GALLERY_DIR)) return new Response("Forbidden", { status: 403 })
      const file = Bun.file(filePath)
      if (!(await file.exists())) return new Response("Not found", { status: 404 })
      return new Response(file)
    }

    if (request.method === "GET" && pathname.startsWith("/viewer-embed/gallery/")) {
      const rel = pathname.slice("/viewer-embed/gallery/".length)
      if (!rel || rel.includes("..")) return new Response("Not found", { status: 404 })
      const htmlPath = path.join(GALLERY_DIR, rel)
      const file = Bun.file(htmlPath)
      if (!(await file.exists())) return new Response("Not found", { status: 404 })
      return new Response(file, { headers: { "content-type": "text/html; charset=utf-8" } })
    }

    if (request.method === "GET" && pathname.startsWith("/viewer-embed/job/")) {
      const parts = pathname.split("/")
      const jobId = parts[3]
      const kind = parts[4]
      if (!jobId || kind !== "viewer.html") return new Response("Not found", { status: 404 })
      const result = await readJobFile(jobId, "html")
      if (!result) return new Response("Not found", { status: 404 })
      return new Response(result.bytes, { headers: { "content-type": "text/html; charset=utf-8" } })
    }

    if (request.method === "GET" && pathname.startsWith("/api/job/")) {
      const parts = pathname.split("/")
      const jobId = parts[3]
      const asset = parts[4]
      if (!jobId) return new Response("Not found", { status: 404 })
      const kind = asset === "strip.png" ? "strip" : asset === "sheet.png" ? "sheet" : null
      if (!kind) return new Response("Not found", { status: 404 })
      const result = await readJobFile(jobId, kind)
      if (!result) return new Response("Not found", { status: 404 })
      return new Response(result.bytes, {
        headers: { "content-type": "image/png", "cache-control": "no-store" },
      })
    }

    if (request.method === "POST" && pathname === "/api/slice") {
      let form: FormData
      try {
        form = await request.formData()
      } catch {
        return json({ error: "Invalid multipart body" }, 400)
      }

      const file = form.get("file")
      if (!(file instanceof File)) {
        return json({ error: "Missing file field" }, 400)
      }

      if (!IMAGE_TYPES.has(file.type) && !file.name.match(/\.(png|webp)$/i)) {
        return json({ error: "Only PNG or WebP images are accepted" }, 415)
      }

      if (file.size > MAX_UPLOAD_BYTES) {
        return json({ error: "File too large" }, 413)
      }

      const bytes = Buffer.from(await file.arrayBuffer())
      const options = parseOptions(form)

      try {
        const { jobId } = await runSlicer(bytes, file.name, options)
        return json({
          jobId,
          title: file.name.replace(/\.[^.]+$/, ""),
          viewerUrl: `/viewer-embed/job/${jobId}/viewer.html`,
          stripUrl: `/api/job/${jobId}/strip.png`,
          sheetUrl: `/api/job/${jobId}/sheet.png`,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Slicer error"
        return json({ error: message }, 500)
      }
    }

    return new Response("Not found", { status: 404 })
  },
})

console.log(`Sprite Stack Studio API on http://localhost:${port}`)