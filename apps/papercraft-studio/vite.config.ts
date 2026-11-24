import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const root = path.dirname(fileURLToPath(import.meta.url))
const papercraftRoot = path.resolve(root, "public/papercraft")

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(root, "./src"),
      // Vendored papercraft imports use `papercraft/lib/...` — alias only, no file edits.
      papercraft: papercraftRoot,
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(root, "index.html"),
        view3d: path.resolve(root, "view-3d.html"),
        view2d: path.resolve(root, "view-2d.html"),
      },
    },
  },
})