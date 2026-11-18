import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const pinDir = path.join(
  appRoot,
  "vendor/amirmushichge-bottle-studio/de876d4"
)
const publicDir = path.join(appRoot, "public/bottle-studio")
const threeRoot = path.join(appRoot, "node_modules/three")

const importMap = `{
  "imports": {
    "three": "/bottle-studio/vendor/three/build/three.module.js",
    "three/addons/": "/bottle-studio/vendor/three/examples/jsm/"
  }
}`

function patchIndexHtml(source) {
  let html = source
  html = html.replace(
    /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">[\s\S]*?display=swap" rel="stylesheet">\n/,
    ""
  )
  html = html.replace(
    /<script type="importmap">[\s\S]*?<\/script>/,
    `<script type="importmap">\n${importMap}\n</script>`
  )
  html = html.replace(
    'content="https://amirmushichge.github.io/bottle-studio/assets/poster.jpg"',
    'content="/bottle-studio/assets/poster.jpg"'
  )
  return html
}

const upstreamHtml = readFileSync(path.join(pinDir, "index.html"), "utf8")
mkdirSync(publicDir, { recursive: true })
writeFileSync(path.join(publicDir, "index.html"), patchIndexHtml(upstreamHtml))

if (!existsSync(threeRoot)) {
  console.error("three is not installed — run bun install first")
  process.exit(1)
}

const vendorThree = path.join(publicDir, "vendor/three")
mkdirSync(path.join(vendorThree, "build"), { recursive: true })
mkdirSync(path.join(vendorThree, "examples/jsm"), { recursive: true })
cpSync(path.join(threeRoot, "build/three.module.js"), path.join(vendorThree, "build/three.module.js"))
cpSync(path.join(threeRoot, "examples/jsm"), path.join(vendorThree, "examples/jsm"), { recursive: true })

const assetsDir = path.join(publicDir, "assets")
mkdirSync(assetsDir, { recursive: true })
const posterPin = path.join(pinDir, "assets/poster.jpg")
if (!existsSync(posterPin)) {
  console.warn("poster.jpg not vendored — skipping copy")
} else {
  cpSync(posterPin, path.join(assetsDir, "poster.jpg"))
}

console.log("Prepared vendored bottle-studio at public/bottle-studio/")