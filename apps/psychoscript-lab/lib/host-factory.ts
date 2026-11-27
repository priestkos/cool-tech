import { Host, Runtime, type Run } from "psychoscript"
import type { Json } from "psychoscript"
import type { ToolCallLogEntry, WeatherProfile } from "./types.ts"

export type HostFactoryOptions = {
  profile: WeatherProfile
  onToolCall?: (entry: ToolCallLogEntry) => void
  includeNonIdempotent?: boolean
  slowDelayMs?: number
}

const SEARCH_FIXTURES: Record<string, Array<{ title: string; url: string }>> = {
  default: [
    { title: "Psychoscript docs", url: "https://psychoscript.com" },
    { title: "OpenCode on X", url: "https://x.com/opencode" },
  ],
}

function weatherFor(city: string, profile: WeatherProfile) {
  const base = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()
  if (profile === "rainy") {
    return { city: base, tempC: 11, summary: `Rain in ${base}`, conditions: "rain" }
  }
  return { city: base, tempC: 22, summary: `Sunny in ${base}`, conditions: "clear" }
}

export function createToolLog(): ToolCallLogEntry[] {
  return []
}

function wrapCall(
  log: ToolCallLogEntry[],
  onToolCall: HostFactoryOptions["onToolCall"],
  name: string,
  args: unknown[],
  callKey: string,
  run: () => unknown | Promise<unknown>,
) {
  const startedAt = Date.now()
  const started = performance.now()
  const push = (result?: Json, error?: { kind: string; message: string }) => {
    const entry: ToolCallLogEntry = {
      key: callKey,
      name,
      args: args as Json,
      result,
      error,
      startedAt,
      durationMs: Math.round(performance.now() - started),
    }
    log.push(entry)
    onToolCall?.(entry)
  }
  try {
    const out = run()
    if (out && typeof (out as Promise<unknown>).then === "function") {
      return (out as Promise<unknown>).then(
        (value) => {
          push(value as Json)
          return value
        },
        (err) => {
          const kind = err && typeof err === "object" && "kind" in err ? String((err as { kind: string }).kind) : "Error"
          const message = err instanceof Error ? err.message : String(err)
          push(undefined, { kind, message })
          throw err
        },
      )
    }
    push(out as Json)
    return out
  } catch (err) {
    const kind = err && typeof err === "object" && "kind" in err ? String((err as { kind: string }).kind) : "Error"
    const message = err instanceof Error ? err.message : String(err)
    push(undefined, { kind, message })
    throw err
  }
}

type TodoRow = { id: number; text: string; done: boolean }

export function makeGlobals(options: HostFactoryOptions, log: ToolCallLogEntry[]) {
  const slowDelayMs = options.slowDelayMs ?? 350

  return (run: Run) => {
    const meta = (run.metadata ?? { todos: [] as TodoRow[], nextId: 1 }) as {
      todos: TodoRow[]
      nextId: number
    }
    run.metadata = meta

    const record = (name: string, args: unknown[], call: { key: string }, fn: () => unknown | Promise<unknown>) =>
      wrapCall(log, options.onToolCall, name, args, call.key, fn)

    const weatherNs = Host.namespace({
      keys: (path) => (path.length === 0 ? ["get", "poll"] : []),
      resolve: (path) => {
        const key = path.join(".")
        if (key === "get") {
          return Host.fn(
            ([city], call) =>
              record("weather.get", [city], call, () => {
                const name = String(city)
                if (name.toLowerCase() === "atlantis") {
                  throw Host.fail("CityNotFound", `No weather for ${name}`, ["Paris", "Oslo", "Tokyo"])
                }
                return weatherFor(name, options.profile)
              }),
            { type: "async", idempotent: true },
          )
        }
        if (key === "poll") {
          return Host.fn(
            ([city], call) =>
              record("weather.poll", [city], call, () =>
                new Promise((resolve, reject) => {
                  const timer = setTimeout(
                    () => resolve({ ...weatherFor(String(city), options.profile), polled: true }),
                    slowDelayMs,
                  )
                  call.signal.addEventListener(
                    "abort",
                    () => {
                      clearTimeout(timer)
                      reject(new DOMException("Aborted", "AbortError"))
                    },
                    { once: true },
                  )
                }),
              ),
            { type: "async", idempotent: true },
          )
        }
        return Host.missing(`weather.${key} is not a function`, ["weather.get", "weather.poll"])
      },
    })

    const searchNs = Host.namespace({
      keys: (path) => (path.length === 0 ? ["query"] : []),
      resolve: (path) => {
        if (path.join(".") !== "query") {
          return Host.missing("search.query missing", ["search.query"])
        }
        return Host.fn(
          ([q], call) =>
            record("search.query", [q], call, () => {
              const query = String(q).toLowerCase()
              const base = SEARCH_FIXTURES.default
              const filtered = base.filter(
                (r) => r.title.toLowerCase().includes(query) || query.includes("forecast"),
              )
              return filtered.length ? filtered : base
            }),
          { type: "async", idempotent: true },
        )
      },
    })

    const todoNs = Host.namespace({
      keys: (path) => (path.length === 0 ? ["add", "list", "done"] : []),
      resolve: (path) => {
        const key = path.join(".")
        if (key === "add") {
          return Host.fn(
            ([text], call) =>
              record("todo.add", [text], call, () => {
                const row = { id: meta.nextId++, text: String(text), done: false }
                meta.todos.push(row)
                return row
              }),
            { type: "async", idempotent: true },
          )
        }
        if (key === "list") {
          return Host.fn(
            (_, call) => record("todo.list", [], call, () => [...meta.todos]),
            { type: "async", idempotent: true },
          )
        }
        if (key === "done") {
          return Host.fn(
            ([id], call) =>
              record("todo.done", [id], call, () => {
                const row = meta.todos.find((t) => t.id === Number(id))
                if (!row) throw Host.fail("NotFound", `Todo ${id} missing`, meta.todos.map((t) => String(t.id)))
                row.done = true
                return row
              }),
            { type: "async", idempotent: true },
          )
        }
        return Host.missing(`todo.${key} is not a function`, ["todo.add", "todo.list", "todo.done"])
      },
    })

    const toolsNs = options.includeNonIdempotent
      ? Host.namespace({
          keys: (path) => (path.length === 0 ? ["slowWrite"] : []),
          resolve: (path) => {
            if (path.join(".") === "slowWrite") {
              return Host.fn(
                ([label], call) =>
                  record("tools.slowWrite", [label], call, () =>
                    new Promise((resolve) => setTimeout(() => resolve({ wrote: String(label) }), slowDelayMs * 2)),
                  ),
                { type: "async", idempotent: false },
              )
            }
            return Host.missing("tools.slowWrite missing", ["tools.slowWrite"])
          },
        })
      : undefined

    const entries: Array<readonly [string, ReturnType<typeof Host.fn>] | readonly [string, typeof weatherNs]> = [
      ["weather", weatherNs],
      ["search", searchNs],
      ["todo", todoNs],
    ]
    if (toolsNs) entries.push(["tools", toolsNs])

    return Object.fromEntries(entries) as Record<string, unknown>
  }
}

export function makeLabRuntime(options: HostFactoryOptions, log: ToolCallLogEntry[] = createToolLog()) {
  return {
    runtime: Runtime.make({
      translate: { functions: "drop", promises: "await" },
      globals: makeGlobals(options, log) as never,
      limits: { timeoutMs: 30_000, maxOutputBytes: 512_000 },
    }),
    log,
  }
}

export function resultToPayload(
  result: Awaited<ReturnType<ReturnType<typeof makeLabRuntime>["runtime"]["execute"]>>,
  log: ToolCallLogEntry[],
  processLabel: string,
) {
  if ("ok" in result && result.ok === true) {
    return {
      ok: true as const,
      value: result.value,
      logs: result.logs,
      warnings: result.warnings?.map((w) => ({ kind: w.kind, message: w.message })),
      toolCalls: log,
      processLabel,
      pid: process.pid,
    }
  }
  if ("ok" in result && result.ok === false) {
    return {
      ok: false as const,
      error: {
        kind: result.error.kind,
        message: result.error.message,
        suggestions: result.error.suggestions,
      },
      logs: result.logs,
      toolCalls: log,
      processLabel,
      pid: process.pid,
    }
  }
  return {
    ok: false as const,
    error: { kind: "Unknown", message: "Unexpected outcome" },
    toolCalls: log,
    processLabel,
    pid: process.pid,
  }
}