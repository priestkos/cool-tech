import {
  ElementsError,
  formatDiagnostics,
  outline,
  render,
  validate,
} from "@hyper-elements/react"
import { renderImage } from "@hyper-elements/react/image"
import { renderPdf } from "@hyper-elements/react/pdf"
import type { IncomingMessage, ServerResponse } from "node:http"
import type { Connect } from "vite"
import { loadStudioAssets } from "./assets.ts"
import { buildTree } from "./card-tree.tsx"
import {
  DEFAULT_DRAFT,
  type CardDraft,
  type StudioRoot,
} from "../shared/card-draft.ts"

type StudioRequest =
  | { action: "validate"; draft: CardDraft; root?: StudioRoot }
  | { action: "outline"; draft: CardDraft; root?: StudioRoot }
  | { action: "render"; draft: CardDraft; root: "email" | "page" }
  | { action: "pdf"; draft: CardDraft }
  | { action: "image"; draft: CardDraft; format?: "png" | "svg" }

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(data))
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(chunk as Buffer)
  }
  const raw = Buffer.concat(chunks).toString("utf8")
  return raw ? (JSON.parse(raw) as unknown) : {}
}

function parseDraft(raw: unknown): CardDraft {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_DRAFT
  }
  const d = raw as Record<string, unknown>
  return {
    heading: typeof d.heading === "string" ? d.heading : DEFAULT_DRAFT.heading,
    body: typeof d.body === "string" ? d.body : DEFAULT_DRAFT.body,
    buttonLabel:
      typeof d.buttonLabel === "string"
        ? d.buttonLabel
        : DEFAULT_DRAFT.buttonLabel,
    buttonHref:
      typeof d.buttonHref === "string" ? d.buttonHref : DEFAULT_DRAFT.buttonHref,
    plantLayoutError: Boolean(d.plantLayoutError),
    plantEmailFix: Boolean(d.plantEmailFix),
  }
}

function errorPayload(error: unknown) {
  if (error instanceof ElementsError) {
    return {
      ok: false as const,
      message: formatDiagnostics(error.diagnostics),
      diagnostics: error.diagnostics,
    }
  }
  if (error instanceof Error) {
    return { ok: false as const, message: error.message, diagnostics: [] }
  }
  return { ok: false as const, message: "Unknown error", diagnostics: [] }
}

function resolveRoot(body: StudioRequest): StudioRoot {
  switch (body.action) {
    case "pdf":
      return "document"
    case "image":
      return "canvas"
    case "render":
      return body.root
    case "validate":
    case "outline":
      return body.root ?? "email"
    default: {
      const _never: never = body
      return _never
    }
  }
}

async function handleStudio(body: StudioRequest) {
  const root = resolveRoot(body)

  const draft = "draft" in body ? parseDraft(body.draft) : DEFAULT_DRAFT
  const tree = buildTree(root, draft)
  const assets = await loadStudioAssets()

  switch (body.action) {
    case "validate": {
      const result = validate(tree)
      const diagnostics = [...result.diagnostics]
      if (root === "email" && result.valid) {
        try {
          const rendered = await render(tree)
          diagnostics.push(...rendered.diagnostics)
        } catch {
          /* render errors are already in validate when invalid */
        }
      }
      const seen = new Set<string>()
      const merged = diagnostics.filter((d) => {
        const key = `${d.code}:${d.path}`
        if (seen.has(key)) {
          return false
        }
        seen.add(key)
        return true
      })
      return { ok: true, valid: result.valid, diagnostics: merged }
    }
    case "outline": {
      const text = outline(tree)
      return { ok: true, outline: text }
    }
    case "render": {
      try {
        const result = await render(tree)
        return {
          ok: true,
          html: result.html,
          text: result.text,
          diagnostics: result.diagnostics,
        }
      } catch (error) {
        return errorPayload(error)
      }
    }
    case "pdf": {
      const doc = buildTree("document", draft)
      const result = await renderPdf(doc, {
        fonts: assets.fonts,
        images: assets.images,
      })
      return {
        ok: true,
        pdfBase64: Buffer.from(result.pdf).toString("base64"),
        diagnostics: result.diagnostics,
      }
    }
    case "image": {
      const canvas = buildTree("canvas", draft)
      const format = body.format ?? "png"
      const result = await renderImage(canvas, {
        fonts: assets.fonts,
        images: assets.images,
        format,
        scale: 2,
      })
      return {
        ok: true,
        format,
        imageBase64: Buffer.from(result.image).toString("base64"),
        width: result.width,
        height: result.height,
        diagnostics: result.diagnostics,
      }
    }
    default: {
      const _never: never = body
      throw new Error(`Unknown action: ${(_never as StudioRequest).action}`)
    }
  }
}

export function createHyperApiMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    const url = req.url ?? ""
    if (!url.startsWith("/api/studio")) {
      next()
      return
    }
    if (req.method !== "POST") {
      sendJson(res, 405, { ok: false, message: "POST required" })
      return
    }
    try {
      const parsed = (await readJsonBody(req)) as StudioRequest
      const payload = await handleStudio(parsed)
      sendJson(res, 200, payload)
    } catch (error) {
      sendJson(res, 422, errorPayload(error))
    }
  }
}
