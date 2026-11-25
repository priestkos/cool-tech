#!/usr/bin/env node
// Write the Cloudflare Pages index for a built site tree.
//
//   node scripts/make-index.mjs <site-dir> [status.tsv]
//
// Apps that call a server API this site does not host are left out of the list
// and shown under "Not yet deployed" instead. Keep PENDING in sync with that
// reality: an app belongs here only while its page cannot work on a static host.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const siteDir = process.argv[2]
if (!siteDir) {
  console.error("usage: node scripts/make-index.mjs <site-dir> [status.tsv]")
  process.exit(1)
}

// Apps whose runtime needs a server or a non-browser process.
const PENDING = [
  {
    group: "workers",
    slug: "openui-agent-ui",
    title: "OpenUI Agent UI",
    reason:
      "Integrate production API routing and validate runtime limits. Local mock mode is verified; live AI may incur separate model-provider charges.",
  },
  {
    group: "workers",
    slug: "copilotkit-genui-catalog",
    title: "CopilotKit Generative UI Catalog",
    reason:
      "Port and secure the streaming backend, including authentication and usage limits. Its labelled mock-only demo could be hosted statically, but is not published here.",
  },
  {
    group: "workers",
    slug: "web-fetch-lab",
    title: "Web Fetch Lab",
    reason:
      "Adapt the fetch backend for Workers while preserving SSRF protections. Free-tier suitability is unverified; the current fixture flow also depends on a backend.",
  },
  {
    group: "process",
    slug: "bun-fmt-playground",
    title: "Bun fmt Playground",
    reason:
      "Needs an isolated Bun runtime to run the actual Bun formatter; static hosting alone is not a useful formatter.",
  },
  {
    group: "process",
    slug: "hyperframes-studio-lite",
    title: "HyperFrames Studio Lite",
    reason:
      "Needs browser/FFmpeg video rendering and compatible isolated compute/storage. An unresolved editable-iframe shared-origin security concern also blocks publication.",
  },
  {
    group: "process",
    slug: "open-code-review-playground",
    title: "Open Code Review Playground",
    reason:
      "Needs Git, review CLI execution and workspaces on an isolated execution service. Live reviews may additionally require model access.",
  },
  {
    group: "process",
    slug: "sandbox-runtime-playground",
    title: "Sandbox Runtime Playground",
    reason:
      "Needs a compatible isolation host for real commands and an OS sandbox. Its labelled policy simulation could be static, but would not provide a real sandbox.",
  },
  {
    group: "process",
    slug: "hyper-elements-studio",
    title: "Hyper Elements Studio",
    reason:
      "Cards render in the Bun server (satori + resvg) behind POST /api/studio; the bundle ships no client-side renderer to fall back on.",
  },
  {
    group: "process",
    slug: "screen-relay-console",
    title: "screen-relay Console",
    reason:
      "The mock relay that feeds frames and control state is a Bun endpoint (/api/lab/*), so a static page has nothing to attach to.",
  },
  {
    group: "process",
    slug: "sprite-stack-studio",
    title: "Sprite Stack Studio",
    reason:
      "Slicing runs the upstream Python slicer behind POST /api/slice, so the studio cannot carve sprites from a static host.",
  },
  {
    group: "process",
    slug: "eve-agent-lab",
    title: "Eve Agent Lab",
    reason:
      "Agent-folder editing and the trace/step panels are served by a Vite dev plugin (/lab/api/*). Only the mock-model chat would survive static hosting.",
  },
]

const pendingSlugs = new Set(PENDING.map((item) => item.slug))

function prettify(slug) {
  const acronyms = new Map([
    ["asog", "ASOG"],
    ["cve", "CVE"],
    ["ui", "UI"],
    ["sdk", "SDK"],
    ["cdp", "CDP"],
    ["rt", "RT"],
    ["api", "API"],
    ["devl", "devl.dev"],
  ])
  const named = new Map([
    ["soundcn-board", "soundcn Board"],
    ["vybbench-lab", "VybBench Lab"],
    ["threert-scene-lab", "ThreeRT Scene Lab"],
    ["audiocn-mixer", "Audio Mixer Board"],
    ["drawio-board", "Diagram Desk"],
    ["leather-wallet-playground", "Wallet Playground"],
    ["pixelfx-forge", "PixelFX Forge"],
  ])
  if (named.has(slug)) return named.get(slug)
  return slug
    .split("-")
    .map((word) => acronyms.get(word) ?? word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function titleFor(slug) {
  const file = join(siteDir, "apps", slug, "index.html")
  if (!existsSync(file)) return prettify(slug)
  const match = readFileSync(file, "utf8").match(/<title>([^<]*)</)
  const raw = match?.[1]?.replace(/\s*·.*$/, "").trim()
  if (!raw) return prettify(slug)
  // A title that is just the slug in lower case adds nothing over prettifying it.
  if (raw.toLowerCase() === slug.toLowerCase()) return prettify(slug)
  if (raw === raw.toLowerCase() && raw.includes("-")) return prettify(slug)
  return raw
}

const appsDir = join(siteDir, "apps")
const built = existsSync(appsDir)
  ? readdirSync(appsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && existsSync(join(appsDir, entry.name, "index.html")))
      .map((entry) => entry.name)
      .filter((slug) => !pendingSlugs.has(slug))
      .map((slug) => ({ slug, title: titleFor(slug) }))
      .sort((a, b) => a.title.localeCompare(b.title))
  : []

const list = built
  .map((app) => `<li><a href="/apps/${app.slug}/">${app.title}</a></li>`)
  .join("\n")

const group = (kind) =>
  PENDING.filter((item) => item.group === kind)
    .map((item) => `    <dt><code>${item.slug}</code></dt>\n    <dd>${item.reason}</dd>`)
    .join("\n")

const published = built.length
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cool Tech Playgrounds</title>
<style>
body{font:16px system-ui;max-width:900px;padding:32px 24px;margin:auto;line-height:1.65}
section{margin-top:48px;padding-top:20px;border-top:1px solid #d1d5db}
dt{font-weight:600;margin-top:16px}
dd{margin:4px 0 12px}
code{overflow-wrap:anywhere}
ul{columns:2;column-gap:32px;padding-left:20px}
li{break-inside:avoid;margin:10px 0}
a{color:#165ccc}
@media(max-width:600px){ul{columns:1}}
</style>
</head>
<body>
<h1>Cool Tech Playgrounds</h1>
<p>${published} browser-based demos. Some use public feeds, embedded editors or browser graphics APIs; no paid backend or model is enabled here.</p>
<ul>
${list}
</ul>
<section id="not-yet-deployed" aria-labelledby="pending-heading">
  <h2 id="pending-heading">Not yet deployed</h2>
  <p>All ${published} playgrounds above are live. The ${PENDING.length} apps below build as static pages but call a server API this site does not host, so publishing them would show a half-working page. Listing them here does not enable them or any paid services.</p>
  <h3>Can become static with a Workers function</h3>
  <dl>
${group("workers")}
  </dl>
  <h3>Needs a real process at runtime</h3>
  <dl>
${group("process")}
  </dl>
  <p><strong>Paying for standard Workers alone will not make these apps work unchanged.</strong> They need a compatible execution service, potentially paid; container compatibility has not been established. No paid backend has been activated for this site.</p>
</section>
</body>
</html>
`

writeFileSync(join(siteDir, "index.html"), html)
console.log(`index.html: ${published} live, ${PENDING.length} pending`)
