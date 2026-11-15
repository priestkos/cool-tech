import type { CatalogAsset } from "./types"

export function importLineForAsset(asset: CatalogAsset): string {
  return `import { createAsset } from 'https://polyfork.dev/cdn/${asset.id}.mjs';`
}

export function polyforkCliCommand(asset: CatalogAsset): string {
  return `npx polyfork@0.1.1 add ${asset.id}`
}

export function snippetBlock(asset: CatalogAsset): string {
  return [
    "// Parametric import (loads from Polyfork CDN at runtime — not redistributed)",
    importLineForAsset(asset),
    `const mesh = createAsset({ /* knobs */ });`,
    "scene.add(mesh);",
    "",
    "// Or use the CLI (MIT, optional):",
    polyforkCliCommand(asset),
  ].join("\n")
}