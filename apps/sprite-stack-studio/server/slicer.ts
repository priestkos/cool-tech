import { existsSync } from "node:fs"
import { mkdir, readdir, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import type { SlicerOptions } from "../src/constants"
import { APP_ROOT, SLICER_PY, VENV_PYTHON } from "./paths"
import { safeSheetBasename } from "./slice-request"

const WORK_ROOT = path.join(APP_ROOT, ".cache/slicer-jobs")

function pythonBin(): string {
  return existsSync(VENV_PYTHON) ? VENV_PYTHON : "python3"
}

export async function runSlicer(
  sheetBytes: Buffer,
  basename: string,
  options: SlicerOptions,
): Promise<{ jobId: string; stripPath: string; htmlPath: string; sheetPath: string }> {
  const jobId = crypto.randomUUID()
  const jobDir = path.join(WORK_ROOT, jobId)
  await mkdir(jobDir, { recursive: true })

  const safeBase = safeSheetBasename(basename)
  const sheetPath = path.join(jobDir, `${safeBase}-sheet.png`)
  const stripPath = path.join(jobDir, `${safeBase}-strip.png`)
  const htmlPath = path.join(jobDir, `${safeBase}-viewer.html`)

  await writeFile(sheetPath, sheetBytes)

  const args = [SLICER_PY, sheetPath, stripPath, "--html", htmlPath]

  if (options.slices !== undefined && options.slices !== null) {
    args.push("--slices", String(options.slices))
  }
  if (options.round) args.push("--round")
  if (options.colours !== undefined) args.push("--colours", String(options.colours))
  if (options.order) args.push("--order", options.order)
  if (options.sideNose) args.push("--side-nose", options.sideNose)
  if (options.shade !== undefined) args.push("--shade", String(options.shade))
  if (options.preview) args.push("--preview", path.join(jobDir, "preview.png"))
  if (options.normals) args.push("--normals", path.join(jobDir, "normals.png"))
  if (options.emissive) args.push("--emissive", path.join(jobDir, "emissive.png"))

  const proc = Bun.spawn([pythonBin(), ...args], {
    stdout: "pipe",
    stderr: "pipe",
    cwd: path.dirname(SLICER_PY),
  })

  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])

  if (code !== 0) {
    await rm(jobDir, { recursive: true, force: true }).catch(() => {})
    throw new Error(`Slicer failed (${code}): ${stderr || stdout}`.slice(0, 4000))
  }

  const stripFile = Bun.file(stripPath)
  if (!(await stripFile.exists()) || stripFile.size === 0) {
    throw new Error("Slicer produced an empty strip")
  }

  return { jobId, stripPath, htmlPath, sheetPath }
}

export async function readJobFile(jobId: string, kind: "strip" | "html" | "sheet"): Promise<{ path: string; bytes: Buffer } | null> {
  const jobDir = path.join(WORK_ROOT, jobId)
  const entries = await readdir(jobDir).catch(() => [] as string[])
  const suffix = kind === "strip" ? "-strip.png" : kind === "html" ? "-viewer.html" : "-sheet.png"
  const match = entries.find((e) => e.endsWith(suffix))
  if (!match) return null
  const filePath = path.join(jobDir, match)
  const bytes = Buffer.from(await Bun.file(filePath).arrayBuffer())
  return { path: filePath, bytes }
}