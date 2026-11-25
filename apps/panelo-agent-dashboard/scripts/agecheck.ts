/**
 * Lockfile age gate — launch time minus 72h (2026-11-22T05:09:26Z for Nov 25 2026 10:39 AM IST).
 */
const CUTOFF = new Date("2026-11-22T05:09:26.000Z")
const LOCK_PATH = new URL("../bun.lock", import.meta.url)
const EVIDENCE_PATH = new URL("../dependency-evidence.json", import.meta.url)

const lockText = await Bun.file(LOCK_PATH).text()
const re = /\[\s*"((?:@[^/"]+\/)?[^@"]+)@([^"]+)"/g
const seen = new Set<string>()
const packages: { name: string; version: string }[] = []
let m: RegExpExecArray | null
while ((m = re.exec(lockText))) {
  const version = m[2]
  if (/^(workspace:|file:|link:|github:|git)/.test(version)) continue
  const key = `${m[1]}@${version}`
  if (seen.has(key)) continue
  seen.add(key)
  packages.push({ name: m[1], version })
}

const results: {
  name: string
  version: string
  published?: string
  ok: boolean
  error?: string
}[] = []
let failures = 0

for (const pkg of packages) {
  const url = `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}`
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as { time?: Record<string, string> }
    const published = data.time?.[pkg.version]
    if (!published) {
      failures++
      results.push({ ...pkg, ok: false, error: "no publish time" })
      continue
    }
    const ok = new Date(published) <= CUTOFF
    if (!ok) failures++
    results.push({ name: pkg.name, version: pkg.version, published, ok })
  } catch (e) {
    failures++
    results.push({ ...pkg, ok: false, error: (e as Error).message })
  }
}

const evidence = {
  cutoffUtc: CUTOFF.toISOString(),
  paneloGitPin: {
    sha: "6517e2e7062f97501e46e73ba1e545f19ef556e2",
    committerUtc: "2026-11-21T16:35:00.000Z",
    license: "MIT",
    source: "https://github.com/raycanvas-ai/paneloui",
  },
  uiSdk: {
    core: "0.1.0-beta.2",
    react: "0.1.0-beta.2",
  },
  packageCount: packages.length,
  failures,
  results,
}

await Bun.write(EVIDENCE_PATH, JSON.stringify(evidence, null, 2))
console.log(`Checked ${packages.length} packages; failures: ${failures}`)
if (failures > 0) process.exit(1)