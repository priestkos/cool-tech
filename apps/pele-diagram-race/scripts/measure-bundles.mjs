import { readdirSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const distAssets = join(import.meta.dirname, "../dist/assets")

function chunkBytes(matcher) {
  let total = 0
  const names = []
  for (const file of readdirSync(distAssets)) {
    if (!matcher(file)) continue
    const bytes = statSync(join(distAssets, file)).size
    total += bytes
    names.push(file)
  }
  return { total, names }
}

const pele = chunkBytes((f) => f.includes("pele"))
const mermaid = chunkBytes((f) => f.includes("mermaid"))

const payload = {
  pele: {
    label: `Vite chunks (${pele.names.length || 0} files)`,
    bytes: pele.total,
    kind: "vite-chunk",
  },
  mermaid: {
    label: `Vite chunks (${mermaid.names.length || 0} files)`,
    bytes: mermaid.total,
    kind: "vite-chunk",
  },
  measuredAt: new Date().toISOString(),
}

writeFileSync(
  join(import.meta.dirname, "../src/lib/bundle-sizes.generated.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
)

console.log("Wrote bundle-sizes.generated.json", payload)
