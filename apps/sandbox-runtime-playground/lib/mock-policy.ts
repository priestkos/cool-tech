import type { PresetDefinition, SrtSettings } from "./types.ts"

function expandPath(p: string, home: string): string {
  if (p === ".") return process.cwd()
  if (p.startsWith("~/")) return `${home}/${p.slice(2)}`
  if (p === "~") return home
  return p
}

function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, "")
}

function hostMatchesPattern(host: string, pattern: string): boolean {
  const h = normalizeHost(host)
  const p = normalizeHost(pattern)
  if (p.startsWith("*.")) {
    const suffix = p.slice(2)
    return h === suffix || h.endsWith(`.${suffix}`)
  }
  return h === p || h.endsWith(`.${p}`)
}

export function isNetworkAllowed(
  url: string,
  settings: SrtSettings,
): { allowed: boolean; reason: string } {
  let host: string
  try {
    host = new URL(url).hostname
  } catch {
    return { allowed: false, reason: "Invalid URL (simulated network deny-all)" }
  }

  for (const denied of settings.network.deniedDomains) {
    if (hostMatchesPattern(host, denied)) {
      return {
        allowed: false,
        reason: `network.deniedDomains matched "${denied}" (simulated)`,
      }
    }
  }

  if (settings.network.allowedDomains.length === 0) {
    return {
      allowed: false,
      reason: "network.allowedDomains is empty — no network (simulated)",
    }
  }

  for (const allowed of settings.network.allowedDomains) {
    if (hostMatchesPattern(host, allowed)) {
      return {
        allowed: true,
        reason: `network.allowedDomains matched "${allowed}" (simulated)`,
      }
    }
  }

  return {
    allowed: false,
    reason: `Host "${host}" not in network.allowedDomains (simulated)`,
  }
}

function pathIsUnder(target: string, root: string): boolean {
  const t = target.replace(/\/+$/, "")
  const r = root.replace(/\/+$/, "")
  if (r === ".") return !t.startsWith("/") || t === "."
  return t === r || t.startsWith(`${r}/`)
}

function readAllowedForPath(
  absolutePath: string,
  settings: SrtSettings,
  home: string,
): { allowed: boolean; reason: string } {
  const denyRead = settings.filesystem.denyRead.map((p) => expandPath(p, home))
  const allowRead = settings.filesystem.allowRead.map((p) => expandPath(p, home))

  for (const deny of denyRead) {
    if (pathIsUnder(absolutePath, deny)) {
      let overridden = false
      for (const allow of allowRead) {
        if (pathIsUnder(absolutePath, allow) && allow.length >= deny.length) {
          if (allow === deny) continue
          if (pathIsUnder(deny, allow)) {
            overridden = true
            break
          }
        }
      }
      if (!overridden) {
        return {
          allowed: false,
          reason: `filesystem.denyRead matched "${deny}" (simulated)`,
        }
      }
    }
  }

  return { allowed: true, reason: "Read permitted by default (simulated)" }
}

function writeAllowedForPath(
  absolutePath: string,
  settings: SrtSettings,
  home: string,
): { allowed: boolean; reason: string } {
  const allowWrite = settings.filesystem.allowWrite.map((p) => expandPath(p, home))
  const denyWrite = settings.filesystem.denyWrite.map((p) => expandPath(p, home))

  for (const deny of denyWrite) {
    if (pathIsUnder(absolutePath, deny)) {
      return {
        allowed: false,
        reason: `filesystem.denyWrite matched "${deny}" (simulated)`,
      }
    }
  }

  if (allowWrite.length === 0) {
    return {
      allowed: false,
      reason: "filesystem.allowWrite is empty — no writes (simulated)",
    }
  }

  for (const allow of allowWrite) {
    if (pathIsUnder(absolutePath, allow)) {
      return {
        allowed: true,
        reason: `filesystem.allowWrite matched "${allow}" (simulated)`,
      }
    }
  }

  return {
    allowed: false,
    reason: `Path not covered by filesystem.allowWrite (simulated)`,
  }
}

export function evaluatePresetMock(
  preset: PresetDefinition,
  settings: SrtSettings,
  home = process.env.HOME ?? "/home/ubuntu",
): { allowed: boolean; reason: string } {
  switch (preset.kind) {
    case "read": {
      const sshDir = `${home}/.ssh`
      return readAllowedForPath(sshDir, settings, home)
    }
    case "network": {
      const url =
        preset.id === "curl-allowed"
          ? "https://github.com"
          : "https://example.com"
      return isNetworkAllowed(url, settings)
    }
    case "write": {
      const target =
        preset.id === "write-tmp"
          ? "/tmp/srt-playground-write-test.txt"
          : `${process.cwd()}/srt-playground-outside-write.txt`
      return writeAllowedForPath(target, settings, home)
    }
    default: {
      const _exhaustive: never = preset.kind
      return _exhaustive
    }
  }
}
