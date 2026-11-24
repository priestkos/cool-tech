import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { SLICER_PY, VENV_PYTHON, APP_ROOT } from "../server/paths"

type GalleryItem = {
  id: string
  title: string
  round?: boolean
  slices?: number
  colours?: number
}

const ITEMS: GalleryItem[] = [
  { id: "round-pot", title: "Round Pot", round: true, slices: 20, colours: 24 },
  { id: "blocky-car", title: "Blocky Car", slices: 18, colours: 24 },
  { id: "pixel-tree", title: "Pixel Tree", slices: 40, colours: 24 },
  { id: "lantern-crate", title: "Lantern Crate", slices: 22, colours: 24 },
]

const python = Bun.file(VENV_PYTHON).size > 0 ? VENV_PYTHON : "python3"
const galleryDir = path.join(APP_ROOT, "public/gallery")

async function runSlicer(sheetPath: string, stripPath: string, htmlPath: string, item: GalleryItem) {
  const args = [SLICER_PY, sheetPath, stripPath, "--html", htmlPath]
  if (item.slices !== undefined) args.push("--slices", String(item.slices))
  if (item.round) args.push("--round")
  if (item.colours !== undefined) args.push("--colours", String(item.colours))
  const proc = Bun.spawn([python, ...args], {
    stdout: "inherit",
    stderr: "inherit",
    cwd: path.dirname(SLICER_PY),
  })
  const code = await proc.exited
  if (code !== 0) throw new Error(`Failed slicing ${item.id}`)
}

async function main() {
  await mkdir(galleryDir, { recursive: true })
  const gen = Bun.spawn([python, "scripts/generate_samples.py"], {
    cwd: APP_ROOT,
    stdout: "inherit",
    stderr: "inherit",
  })
  if ((await gen.exited) !== 0) process.exit(1)

  const manifest: { items: Array<Record<string, unknown>> } = { items: [] }

  for (const item of ITEMS) {
    const sheetSrc = path.join(APP_ROOT, "samples/raw", `${item.id}-sheet.png`)
    const sheetDst = path.join(galleryDir, `${item.id}-sheet.png`)
    const stripDst = path.join(galleryDir, `${item.id}-strip.png`)
    const htmlDst = path.join(galleryDir, `${item.id}-viewer.html`)

    await Bun.write(sheetDst, Bun.file(sheetSrc))
    await runSlicer(sheetDst, stripDst, htmlDst, item)

    manifest.items.push({
      id: item.id,
      title: item.title,
      sheetUrl: `/gallery-data/assets/${item.id}-sheet.png`,
      stripUrl: `/gallery-data/assets/${item.id}-strip.png`,
      viewerUrl: `/viewer-embed/gallery/${item.id}-viewer.html`,
      options: {
        round: Boolean(item.round),
        slices: item.slices ?? null,
        colours: item.colours ?? 24,
      },
    })
  }

  await writeFile(path.join(galleryDir, "manifest.json"), JSON.stringify(manifest, null, 2))
  console.log(`Gallery ready: ${manifest.items.length} items`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})