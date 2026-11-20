import type { Plugin } from "vite"
import { createRelayLabApiMiddleware } from "./relay-lab-api"

export function relayLabApiPlugin(): Plugin {
  const api = createRelayLabApiMiddleware()
  return {
    name: "screen-relay-lab-api",
    configureServer(server) {
      server.middlewares.use(api)
    },
    configurePreviewServer(server) {
      server.middlewares.use(api)
    },
  }
}