import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { createHyperApiMiddleware } from "./server/hyper-api"

function hyperElementsApiPlugin(): Plugin {
  return {
    name: "hyper-elements-api",
    configureServer(server) {
      server.middlewares.use(createHyperApiMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(createHyperApiMiddleware())
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), hyperElementsApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    strictPort: true,
    port: 5173,
  },
})
