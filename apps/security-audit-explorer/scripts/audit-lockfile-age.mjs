#!/usr/bin/env node
/**
 * Lockfile transitive age audit for PR evidence.
 */
import fs from "node:fs"

const cutoff = new Date("2026-11-06T03:30:00.000Z")
const lockText = fs.readFileSync(new URL("../bun.lock", import.meta.url), "utf8")
const pkgRegex = /":\s*\["(@?[^"]+@[^"]+)"/g
const seen = new Set()
const entries = []
const packageTimeCache = new Map()

async function publishedAt(name, version) {
  if (!packageTimeCache.has(name)) {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const meta = await res.json()
    packageTimeCache.set(name, meta.time ?? {})
  }
  const time = packageTimeCache.get(name)[version]
  if (!time) throw new Error("missing time entry")
  return new Date(time)
}

for (const match of lockText.matchAll(pkgRegex)) {
  const id = match[1]
  if (seen.has(id)) continue
  seen.add(id)

  const at = id.lastIndexOf("@")
  if (at <= 0) continue
  const name = id.slice(0, at)
  const version = id.slice(at + 1)

  try {
    const published = await publishedAt(name, version)
    entries.push({
      name,
      version,
      published: published.toISOString(),
      eligible: published <= cutoff,
    })
  } catch (error) {
    entries.push({ name, version, eligible: false, error: String(error) })
  }
}

const ineligible = entries.filter((e) => !e.eligible)
const summary = {
  auditedAtUtc: new Date().toISOString(),
  cutoffUtc: cutoff.toISOString(),
  packageCount: entries.length,
  ineligibleCount: ineligible.length,
  allEligible: ineligible.length === 0,
  ineligible,
}

console.log(JSON.stringify(summary, null, 2))
