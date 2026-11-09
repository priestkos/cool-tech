import { build, fileURLToPath } from "bun"
import fs from "node:fs"
import path from "node:path"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..")
const vendor = path.join(
  root,
  "vendor/cloudflare-security-audit-skill/c1c8a8c1471069fb0e188eeaff69b8e8db6564a8"
)
const shim = path.join(root, "src/vendor-shim")

const PATH_INJECT =
  'var path = { join: function(...parts){ return parts.filter(Boolean).join("/").replace(/\\/+/g,"/"); }, posix: { isAbsolute: function(v){ return typeof v==="string" && v.startsWith("/"); } }, win32: { isAbsolute: function(v){ return typeof v==="string" && /^[A-Za-z]:/.test(v); } } };'

function patchBundle(outfile) {
  let text = fs.readFileSync(outfile, "utf8")
  text = text.replace(/var path = \(init_path(?:_browser|_shim)?\(\), \{\}\);/g, PATH_INJECT)
  text = text.replace(/var path = \(\(\) => \(\{\}\)\(\);/, PATH_INJECT)
  text = text.replace(/var path = \(init_path\(\), \{\}\);/, PATH_INJECT)
  text = text.replace(
    /var \{ TextDecoder \} = __require\("util"\);/,
    "var { TextDecoder } = globalThis;"
  )
  text = text.replace(
    /var \{ TextDecoder \} = \(init_util\(\), __toCommonJS\(exports_util\)\);/,
    "var { TextDecoder } = globalThis;"
  )
  text = text.replace(
    /posix\.isAbsolute\(value\) \|\| undefined\.isAbsolute\(value\)/g,
    "path.posix.isAbsolute(value) || path.win32.isAbsolute(value)"
  )
  fs.writeFileSync(outfile, text)
}

async function bundle(entry, outfile) {
  const result = await build({
    entrypoints: [entry],
    outdir: path.dirname(outfile),
    naming: path.basename(outfile),
    target: "browser",
    format: "esm",
  })
  if (!result.success) {
    console.error(result.logs)
    process.exit(1)
  }
  patchBundle(outfile)
}

await bundle(path.join(vendor, "validate-findings.cjs"), path.join(shim, "validate-findings.bundle.js"))
await bundle(path.join(vendor, "validate-coverage-ledger.cjs"), path.join(shim, "validate-coverage-ledger.bundle.js"))
console.log("Vendored validator browser bundles updated.")
