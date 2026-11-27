import { handleLabRequest } from "./handler.ts"

const port = Number(process.env.PSYCHOSCRIPT_LAB_API_PORT ?? "4177")

Bun.serve({
  port,
  hostname: "127.0.0.1",
  async fetch(req) {
    return handleLabRequest(req)
  },
})

console.log(`[psychoscript-lab] API on http://127.0.0.1:${port}`)
