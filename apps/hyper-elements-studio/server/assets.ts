import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { LOGO_SRC } from "./card-tree.tsx"
import type { ImageFont } from "@hyper-elements/react/image"
import type { PdfFont } from "@hyper-elements/react/pdf"

const appRoot = path.dirname(fileURLToPath(import.meta.url))
const assetsDir = path.join(appRoot, "../src/assets")

type StudioAssets = {
  fonts: PdfFont[]
  images: Record<string, Uint8Array>
}

let cached: StudioAssets | null = null

export async function loadStudioAssets(): Promise<StudioAssets> {
  if (cached) {
    return cached
  }
  const [regular, bold, logo] = await Promise.all([
    readFile(path.join(assetsDir, "Arimo-Regular.ttf")),
    readFile(path.join(assetsDir, "Arimo-Bold.ttf")),
    readFile(path.join(assetsDir, "card-logo.png")),
  ])
  const fonts: ImageFont[] = [
    { family: "Arimo", src: new Uint8Array(regular), weight: 400, style: "normal" },
    { family: "Arimo", src: new Uint8Array(bold), weight: 700, style: "normal" },
  ]
  cached = {
    fonts,
    images: { [LOGO_SRC]: new Uint8Array(logo) },
  }
  return cached
}
