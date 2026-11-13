import type { CardDraft } from "../../../shared/card-draft.ts"

type ValidateResponse = {
  ok: boolean
  valid?: boolean
  diagnostics?: Array<{
    code: string
    severity: string
    message: string
    path: string
    clients?: string[]
    fix?: string
    see?: string
  }>
  message?: string
}

type OutlineResponse = { ok: boolean; outline?: string; message?: string }

type RenderResponse = {
  ok: boolean
  html?: string
  diagnostics?: ValidateResponse["diagnostics"]
  message?: string
}

type PdfResponse = {
  ok: boolean
  pdfBase64?: string
  message?: string
}

type ImageResponse = {
  ok: boolean
  imageBase64?: string
  format?: string
  message?: string
}

async function post<T>(body: unknown): Promise<T> {
  const res = await fetch("/api/studio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return (await res.json()) as T
}

export function studioValidate(draft: CardDraft) {
  return post<ValidateResponse>({ action: "validate", draft, root: "email" })
}

export function studioOutline(draft: CardDraft) {
  return post<OutlineResponse>({ action: "outline", draft, root: "email" })
}

export function studioRender(root: "email" | "page", draft: CardDraft) {
  return post<RenderResponse>({ action: "render", root, draft })
}

export function studioPdf(draft: CardDraft) {
  return post<PdfResponse>({ action: "pdf", draft })
}

export function studioImage(draft: CardDraft, format: "png" | "svg") {
  return post<ImageResponse>({ action: "image", draft, format })
}

export type { CardDraft }
