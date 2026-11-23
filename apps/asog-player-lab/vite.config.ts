import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  assetsInclude: ["**/*.asog"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@animated-sog/three": path.resolve(
        __dirname,
        "vendor/animated-sog/js/src/three/index.js",
      ),
      "@animated-sog/decode": path.resolve(
        __dirname,
        "vendor/animated-sog/js/src/core/decode.js",
      ),
      three: path.resolve(__dirname, "node_modules/three"),
    },
  },
  optimizeDeps: {
    exclude: ["@/vendor/animated-sog/js/src"],
  },
})