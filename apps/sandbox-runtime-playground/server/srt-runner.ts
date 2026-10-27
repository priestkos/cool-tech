import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { spawn } from "node:child_process"
import { evaluatePresetMock } from "../lib/mock-policy.ts"
import { presetById } from "../lib/presets.ts"
import type { PresetId, RunResult, SrtSettings } from "../lib/types.ts"
import { redactSensitive, sanitizeSshPresetOutput } from "../lib/redact.ts"

const APP_ROOT = join(import.meta.dirname, "..")
const TEMP_DIR = join(APP_ROOT, ".tmp", "srt-settings")

export type SrtStatus = {
  usable: boolean
  platform: string
  missing: string[]
  message: string
}

let statusCache: { at: number; value: SrtStatus } | null = null

async function checkSrtUsable(): Promise<SrtStatus> {
  const now = Date.now()
  if (statusCache && now - statusCache.at < 15_000) {
    return statusCache.value
  }

  const missing: string[] = []
  const platform = process.platform

  try {
    const { SandboxManager } = await import("@anthropic-ai/sandbox-runtime")
    const dep = await SandboxManager.checkDependenciesAsync()
    for (const err of dep.errors) {
      missing.push(err)
    }
    await SandboxManager.reset()
  } catch (err) {
    missing.push(err instanceof Error ? err.message : String(err))
  }

  let smokeOk = false
  if (missing.length === 0) {
    smokeOk = await smokeTestSrtCli()
    if (!smokeOk) {
      missing.push("srt CLI smoke test failed (echo ok)")
    }
  }

  const usable = missing.length === 0 && smokeOk
  const value: SrtStatus = {
    usable,
    platform,
    missing,
    message: usable
      ? "sandbox-runtime dependencies OK; real mode available."
      : `Real srt unavailable: ${missing.join("; ") || "unknown"}`,
  }
  statusCache = { at: now, value }
  return value
}

async function smokeTestSrtCli(): Promise<boolean> {
  await mkdir(TEMP_DIR, { recursive: true })
  const settingsPath = join(TEMP_DIR, `smoke-${Date.now()}.json`)
  const settings: SrtSettings = {
    filesystem: {
      denyRead: [],
      allowRead: ["."],
      allowWrite: ["."],
      denyWrite: [],
    },
    network: { allowedDomains: [], deniedDomains: [] },
  }
  await writeFile(settingsPath, JSON.stringify(settings, null, 2))
  return new Promise((resolve) => {
    const child = spawn(
      "node",
      [
        join(APP_ROOT, "node_modules/@anthropic-ai/sandbox-runtime/dist/cli.js"),
        "--settings",
        settingsPath,
        "echo",
        "ok",
      ],
      { cwd: APP_ROOT, env: process.env },
    )
    let out = ""
    child.stdout.on("data", (d) => {
      out += d.toString()
    })
    child.on("close", (code) => {
      resolve(code === 0 && out.includes("ok"))
    })
    child.on("error", () => resolve(false))
  })
}

export async function getSrtStatus(): Promise<SrtStatus> {
  return checkSrtUsable()
}

async function writeSettingsFile(settings: SrtSettings): Promise<string> {
  await mkdir(TEMP_DIR, { recursive: true })
  const file = join(TEMP_DIR, `run-${Date.now()}-${Math.random().toString(36).slice(2)}.json`)
  await writeFile(file, JSON.stringify(settings, null, 2))
  return file
}

async function runRealPreset(
  presetId: PresetId,
  settings: SrtSettings,
  command: string,
): Promise<RunResult> {
  const started = performance.now()
  const settingsPath = await writeSettingsFile(settings)
  const commandId = `preset-${presetId}-${Date.now()}`

  const { SandboxManager } = await import("@anthropic-ai/sandbox-runtime")
  await SandboxManager.initialize(settings)
  const wrapped = await SandboxManager.wrapWithSandbox(command, undefined, settings, undefined, {
    commandId,
  })

  const wrappedCommand = wrapped
  return new Promise((resolve) => {
    const child = spawn(wrappedCommand, {
      shell: true,
      cwd: APP_ROOT,
      env: process.env,
    })
    let stdout = ""
    let stderr = ""
    child.stdout.on("data", (d) => {
      stdout += d.toString()
    })
    child.stderr.on("data", (d) => {
      stderr += d.toString()
    })
    child.on("close", async (code) => {
      const annotated = SandboxManager.annotateStderrWithSandboxFailures(commandId, stderr)
      const violations =
        SandboxManager.getSandboxViolationStore().getViolationsForCommand(commandId)
      await SandboxManager.reset()

      let allowed = code === 0
      let reason = allowed ? "Command exited 0" : `Exit code ${code ?? "unknown"}`
      if (annotated && annotated !== stderr) {
        allowed = false
        reason = annotated.trim() || reason
      }
      if (violations && violations.length > 0) {
        allowed = false
        reason = violations.map((v: { message?: string }) => v.message ?? String(v)).join("; ")
      }

      if (presetId === "read-ssh") {
        stdout = sanitizeSshPresetOutput(stdout, stderr)
        stderr = ""
      } else {
        stdout = redactSensitive(stdout).slice(0, 500)
        stderr = redactSensitive(annotated || stderr).slice(0, 500)
      }

      resolve({
        presetId,
        command,
        allowed,
        reason,
        durationMs: Math.round(performance.now() - started),
        mode: "real",
        stdout,
        stderr,
      })
    })
    child.on("error", async (err) => {
      await SandboxManager.reset()
      resolve({
        presetId,
        command,
        allowed: false,
        reason: err.message,
        durationMs: Math.round(performance.now() - started),
        mode: "real",
        stdout: "",
        stderr: err.message,
      })
    })
  })
}

function runMockPreset(
  presetId: PresetId,
  settings: SrtSettings,
  command: string,
): RunResult {
  const started = performance.now()
  const preset = presetById(presetId)
  if (!preset) {
    return {
      presetId,
      command,
      allowed: false,
      reason: "Unknown preset",
      durationMs: 0,
      mode: "simulated",
      stdout: "",
      stderr: "",
    }
  }
  const { allowed, reason } = evaluatePresetMock(preset, settings)
  return {
    presetId,
    command,
    allowed,
    reason,
    durationMs: Math.round(performance.now() - started),
    mode: "simulated",
    stdout: allowed ? "(simulated success)" : "",
    stderr: allowed ? "" : reason,
  }
}

export async function runPreset(
  presetId: PresetId,
  settings: SrtSettings,
  useReal: boolean,
): Promise<RunResult> {
  const preset = presetById(presetId)
  if (!preset) {
    throw new Error(`Unknown preset: ${presetId}`)
  }
  const command = preset.shellCommand
  if (useReal) {
    const status = await getSrtStatus()
    if (!status.usable) {
      return runMockPreset(presetId, settings, command)
    }
    return runRealPreset(presetId, settings, command)
  }
  return runMockPreset(presetId, settings, command)
}
