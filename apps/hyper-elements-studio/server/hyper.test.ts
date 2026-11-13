import { describe, expect, test } from "bun:test"
import { render, validate, outline } from "@hyper-elements/react"
import { renderImage } from "@hyper-elements/react/image"
import { renderPdf } from "@hyper-elements/react/pdf"
import { loadStudioAssets } from "./assets.ts"
import { buildTree } from "./card-tree.tsx"
import { DEFAULT_DRAFT, type CardDraft } from "../shared/card-draft.ts"

const validDraft: CardDraft = {
  ...DEFAULT_DRAFT,
  plantLayoutError: false,
  plantEmailFix: false,
}
const invalidDraft: CardDraft = { ...DEFAULT_DRAFT, plantLayoutError: true }

describe("Hyper Elements studio integration", () => {
  test("validate() accepts a correct card", () => {
    const tree = buildTree("email", validDraft)
    const result = validate(tree)
    expect(result.valid).toBe(true)
  })

  test("validate() rejects planted margin with fix and path", () => {
    const tree = buildTree("email", invalidDraft)
    const result = validate(tree)
    expect(result.valid).toBe(false)
    const marginDiag = result.diagnostics.find((d) =>
      d.path.includes("marginBottom"),
    )
    expect(marginDiag).toBeDefined()
    expect(marginDiag?.path.length).toBeGreaterThan(0)
    expect(marginDiag?.message).toMatch(/gap|padding/i)
  })

  test("render() exposes email-client fix when font stack lacks fallback", async () => {
    const tree = buildTree("email", { ...DEFAULT_DRAFT, plantEmailFix: true })
    const { diagnostics } = await render(tree)
    const fontDiag = diagnostics.find((d) => d.fix && d.clients?.length)
    expect(fontDiag).toBeDefined()
    expect(fontDiag?.fix).toMatch(/Arial|sans-serif/i)
  })

  test("outline() contains heading words", () => {
    const tree = buildTree("email", validDraft)
    const text = outline(tree)
    expect(text).toContain("Welcome")
    expect(text.match(/\d+px|width/i)).toBeTruthy()
  })

  test("render() Email HTML includes doctype and heading", async () => {
    const tree = buildTree("email", validDraft)
    const { html } = await render(tree)
    expect(html.toLowerCase()).toContain("<!doctype")
    expect(html).toContain(validDraft.heading)
  })

  test("render() Page HTML includes doctype and heading", async () => {
    const tree = buildTree("page", validDraft)
    const { html } = await render(tree)
    expect(html.toLowerCase()).toContain("<!doctype")
    expect(html).toContain(validDraft.heading)
  })

  test("renderPdf() returns PDF magic bytes", async () => {
    const assets = await loadStudioAssets()
    const tree = buildTree("document", validDraft)
    const { pdf } = await renderPdf(tree, {
      fonts: assets.fonts,
      images: assets.images,
    })
    const magic = new TextDecoder().decode(pdf.slice(0, 4))
    expect(magic).toBe("%PDF")
  })

  test("renderImage() returns PNG signature", async () => {
    const assets = await loadStudioAssets()
    const tree = buildTree("canvas", validDraft)
    const { image } = await renderImage(tree, {
      fonts: assets.fonts,
      images: assets.images,
      format: "png",
    })
    expect(image[0]).toBe(0x89)
    expect(image[1]).toBe(0x50)
    expect(image[2]).toBe(0x4e)
    expect(image[3]).toBe(0x47)
  })

  test("renderImage() returns SVG when format is svg", async () => {
    const assets = await loadStudioAssets()
    const tree = buildTree("canvas", validDraft)
    const { image } = await renderImage(tree, {
      fonts: assets.fonts,
      images: assets.images,
      format: "svg",
    })
    const text = new TextDecoder().decode(image)
    expect(text.includes("<svg")).toBe(true)
  })
})
