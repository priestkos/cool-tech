import { Runtime, SnapshotError, fromBytes, toBytes, type Program } from "psychoscript"
import { SuspendError } from "../node_modules/psychoscript/dist/runtime.js"
import { ESCAPE_PROBES } from "./escape-probes.ts"
import { makeGlobals, makeLabRuntime, resultToPayload } from "./host-factory.ts"
import { presetById } from "./presets.ts"
import type { EscapeProbeId, PresetId, WeatherProfile } from "./types.ts"

export async function executeCode(code: string, profile: WeatherProfile = "sunny", includeTools = false) {
  const { runtime, log } = makeLabRuntime({ profile, includeNonIdempotent: includeTools })
  const result = await runtime.execute(code)
  return resultToPayload(result, log, "parent Bun server")
}

export async function executePreset(presetId: PresetId, profile: WeatherProfile = "sunny") {
  const preset = presetById(presetId)
  return executeCode(preset.code, profile, presetId === "suspend-blocked")
}

export async function runEscapeProbes() {
  const { runtime } = makeLabRuntime({ profile: "sunny" })
  const rows: Array<{ id: EscapeProbeId; label: string; ok: boolean; error?: string; value?: unknown }> = []
  for (const probe of ESCAPE_PROBES) {
    const result = await runtime.execute(probe.code)
    if (result.ok) {
      rows.push({ id: probe.id, label: probe.label, ok: true, value: result.value })
    } else {
      rows.push({
        id: probe.id,
        label: probe.label,
        ok: false,
        error: `${result.error.kind}: ${result.error.message}`,
      })
    }
  }
  return rows
}

export async function suspendResumeRoundTrip(code: string, slowDelayMs = 80) {
  const log: ReturnType<typeof makeLabRuntime>["log"] = []
  const waiting = Runtime.make({
    translate: { functions: "drop", promises: "await" },
    globals: makeGlobals({ profile: "sunny", slowDelayMs }, log) as never,
  })
  const program = waiting.program(code)
  const running = program.run()
  await Bun.sleep(15)
  const suspended = await program.suspend()
  await running
  if (!("ok" in suspended) || suspended.ok !== "suspended") {
    throw new Error("expected suspended outcome")
  }
  const bytes = toBytes(suspended.state)
  const cont = Runtime.make({
    translate: { functions: "drop", promises: "await" },
    globals: makeGlobals({ profile: "sunny", slowDelayMs }, []) as never,
  })
  const resumed = await cont.resume(fromBytes(bytes)).run()
  const uninterruptedLog: ReturnType<typeof makeLabRuntime>["log"] = []
  const straight = Runtime.make({
    translate: { functions: "drop", promises: "await" },
    globals: makeGlobals({ profile: "sunny", slowDelayMs }, uninterruptedLog) as never,
  })
  const baseline = await straight.execute(code)
  return { bytes, resumed, baseline }
}

export async function forkSnapshot(bytes: Uint8Array, left: WeatherProfile, right: WeatherProfile) {
  const leftLog: ReturnType<typeof makeLabRuntime>["log"] = []
  const rightLog: ReturnType<typeof makeLabRuntime>["log"] = []
  const leftRt = Runtime.make({
    translate: { functions: "drop", promises: "await" },
    globals: makeGlobals({ profile: left }, leftLog) as never,
  })
  const rightRt = Runtime.make({
    translate: { functions: "drop", promises: "await" },
    globals: makeGlobals({ profile: right }, rightLog) as never,
  })
  const state = fromBytes(bytes)
  const [a, b] = await Promise.all([
    leftRt.resume(state).run(),
    rightRt.resume(state).run(),
  ])
  return {
    left: resultToPayload(a, leftLog, "fork A (sunny)"),
    right: resultToPayload(b, rightLog, "fork B (rainy)"),
  }
}

export function corruptBytes(bytes: Uint8Array): Uint8Array {
  const copy = new Uint8Array(bytes)
  if (copy.length > 10) copy[10] ^= 0xff
  else copy[0] ^= 0xff
  return copy
}

export function tryResumeCorrupt(bytes: Uint8Array) {
  const rt = makeLabRuntime({ profile: "sunny" }).runtime
  try {
    rt.resume(fromBytes(bytes))
    return { ok: false as const, error: "expected SnapshotError" }
  } catch (err) {
    if (err instanceof SnapshotError) {
      return { ok: true as const, name: err.name, message: err.message }
    }
    throw err
  }
}

export async function demonstrateSuspendBlocked(slowDelayMs = 120) {
  const code = presetById("suspend-blocked").code
  const log: ReturnType<typeof makeLabRuntime>["log"] = []
  const rt = Runtime.make({
    translate: { functions: "drop", promises: "await" },
    globals: makeGlobals({ profile: "sunny", includeNonIdempotent: true, slowDelayMs }, log) as never,
  })
  const program = rt.program(code)
  const running = program.run()
  await Bun.sleep(20)
  try {
    await program.suspend()
    await running
    return { rejected: false as const, message: "unexpected success" }
  } catch (err) {
    await running.catch(() => {})
    if (err instanceof SuspendError) {
      return {
        rejected: true as const,
        name: err.name,
        message: err.message,
        running: err.running,
      }
    }
    throw err
  }
}

export type ActiveSession = {
  id: string
  program: Program
  running: Promise<unknown>
  code: string
}

const sessions = new Map<string, ActiveSession>()

export function startSuspendableSession(code: string, slowDelayMs = 350): ActiveSession {
  const log: ReturnType<typeof makeLabRuntime>["log"] = []
  const rt = Runtime.make({
    translate: { functions: "drop", promises: "await" },
    globals: makeGlobals({ profile: "sunny", slowDelayMs }, log) as never,
  })
  const program = rt.program(code)
  const running = program.run()
  const id = crypto.randomUUID()
  const session = { id, program, running, code }
  sessions.set(id, session)
  return session
}

export function getSession(id: string) {
  return sessions.get(id)
}

export function dropSession(id: string) {
  sessions.delete(id)
}

export async function suspendSession(id: string) {
  const session = sessions.get(id)
  if (!session) throw new RangeError("session not found")
  const outcome = await session.program.suspend()
  await session.running
  sessions.delete(id)
  if (!("ok" in outcome) || outcome.ok !== "suspended") {
    return { suspended: false as const, outcome }
  }
  const bytes = toBytes(outcome.state)
  return { suspended: true as const, byteLength: bytes.length, bytesBase64: Buffer.from(bytes).toString("base64") }
}

export async function resumeBytes(bytes: Uint8Array, profile: WeatherProfile, label: string) {
  const { runtime, log } = makeLabRuntime({ profile })
  const result = await runtime.resume(fromBytes(bytes)).run()
  return resultToPayload(result, log, label)
}