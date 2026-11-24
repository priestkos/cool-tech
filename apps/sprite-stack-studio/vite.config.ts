import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const API_PORT = process.env.SPRITE_STACK_STUDIO_API_PORT ?? "3924"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
      "/viewer-embed": {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
      "/gallery-data": {
        target: `http://localhost:${API_PORT}`,
        changeOrigin: true,
      },
    },
  },
})