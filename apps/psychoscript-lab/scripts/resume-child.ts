import { fromBytes } from "psychoscript"
import { makeLabRuntime, resultToPayload } from "../lib/host-factory.ts"
import type { WeatherProfile } from "../lib/types.ts"

const raw = await new Response(Bun.stdin).text()
const body = JSON.parse(raw) as { bytesBase64: string; profile?: WeatherProfile }
const bytes = Uint8Array.from(Buffer.from(body.bytesBase64, "base64"))
const profile = body.profile ?? "sunny"
const { runtime, log } = makeLabRuntime({ profile })
const result = await runtime.resume(fromBytes(bytes)).run()
const payload = resultToPayload(result, log, `child Bun worker (pid ${process.pid})`)
console.log(JSON.stringify(payload))