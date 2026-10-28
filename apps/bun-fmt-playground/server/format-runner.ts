import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { bunVersionAtLeast } from "../lib/bun-version.ts"
import {
  buildFmtFlags,
  LANGUAGE_EXT,
  languageToExtension,
  type FormatOptionsInput,
} from "../lib/flags.ts"

const FMT_TIMEOUT_MS = 5000
const MAX_STDERR_BYTES = 4096
const MIN_BUN = "1.4.4"

let formatBusy = false

export function isFormatBusy(): boolean {
  return formatBusy
}

export async function withFormatSlot<T>(
  fn: () => Promise<T>,
): Promise<T | { error: string; status: number }> {
  if (formatBusy) {
    return { error: "Another format request is in progress", status: 429 }
  }
  formatBusy = true
  try {
    return await fn()
  } finally {
    formatBusy = false
  }
}

export async function getFmtStatus() {
  const bunVersion = Bun.version
  const supportsFmt = bunVersionAtLeast(bunVersion, MIN_BUN)
  let fmtVersion: string | null = null
  let smokeOk = false

  if (supportsFmt) {
    const versionProc = Bun.spawn([process.execPath, "fmt", "--version"], {
      stdout: "pipe",
      stderr: "pipe",
    })
    fmtVersion = (await new Response(versionProc.stdout).text()).trim()
    await versionProc.exited

    const smokeProc = Bun.spawn(
      [process.execPath, "fmt", "--no-config", "--no-editorconfig", "--stdin-filepath=x.json"],
      {
        stdin: Buffer.from('{"a":1}'),
        stdout: "pipe",
        stderr: "pipe",
      },
    )
    const smokeOut = (await new Response(smokeProc.stdout).text()).trim()
    await smokeProc.exited
    smokeOk = smokeProc.exitCode === 0 && smokeOut.includes('"a"')
  }

  return {
    bunVersion,
    supportsFmt,
    fmtVersion,
    smokeOk,
  }
}

export type FormatSuccess = {
  formatted: string
  changed: boolean
  elapsedMs: number
  fmtReportedMs?: number
  stderr?: string
}

export type FormatFailure = {
  error: string
  status: number
  elapsedMs?: number
  stderr?: string
}

export async function runFormat(
  language: string,
  code: string,
  options: FormatOptionsInput,
): Promise<FormatSuccess | FormatFailure> {
  const lang = languageToExtension(language)
  if (!lang) {
    return { error: "Unsupported language", status: 400 }
  }

  if (!bunVersionAtLeast(Bun.version, MIN_BUN)) {
    return { error: "bun fmt requires Bun >= 1.4.4", status: 503 }
  }

  const flagResult = buildFmtFlags(options)
  if (!flagResult.ok) {
    return { error: flagResult.errors.join("; "), status: 400 }
  }

  const ext = LANGUAGE_EXT[lang]
  const tmpDir = await mkdtemp(join(tmpdir(), "bun-fmt-playground-"))
  const filePath = join(tmpDir, `input.${ext}`)

  try {
    await writeFile(filePath, code, "utf8")

    const args = [
      process.execPath,
      "fmt",
      "--no-config",
      "--no-editorconfig",
      ...flagResult.flags,
      filePath,
    ]

    const start = performance.now()
    const proc = Bun.spawn(args, { stdout: "pipe", stderr: "pipe" })
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      proc.kill()
    }, FMT_TIMEOUT_MS)

    await proc.exited
    clearTimeout(timer)
    const elapsedMs = performance.now() - start

    if (timedOut) {
      return { error: "bun fmt timed out after 5 seconds", status: 504, elapsedMs }
    }

    const stderrRaw = await new Response(proc.stderr).text()
    const stderr =
      stderrRaw.length > MAX_STDERR_BYTES
        ? stderrRaw.slice(0, MAX_STDERR_BYTES)
        : stderrRaw

    const timingMatch = stderr.match(/\[([\d.]+)ms\]/)
    const fmtReportedMs = timingMatch ? Number.parseFloat(timingMatch[1]!) : undefined

    if (proc.exitCode !== 0) {
      const message = stderr.trim() || "bun fmt exited with an error"
      return {
        error: message,
        status: 422,
        elapsedMs,
        stderr: stderr.trim() || undefined,
      }
    }

    const formatted = await readFile(filePath, "utf8")
    const changed = formatted !== code

    return {
      formatted,
      changed,
      elapsedMs,
      fmtReportedMs,
      stderr: stderr.trim() || undefined,
    }
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}
