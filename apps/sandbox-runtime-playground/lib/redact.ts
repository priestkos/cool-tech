const KEY_PATTERNS = [
  /BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY/gi,
  /BEGIN CERTIFICATE/gi,
  /ssh-[a-z0-9-]+ AAAA[0-9A-Za-z+/]+[=]{0,3}/g,
]

export function redactSensitive(text: string): string {
  let out = text
  for (const pattern of KEY_PATTERNS) {
    out = out.replace(pattern, "[REDACTED]")
  }
  if (out.includes(".ssh/") && /id_|authorized_keys/.test(out)) {
    return "[REDACTED: possible SSH path or key material]"
  }
  return out
}

export function sanitizeSshPresetOutput(stdout: string, stderr: string): string {
  const combined = `${stdout}\n${stderr}`.trim()
  if (!combined) return "Access check completed (no listing output)."
  if (/Operation not permitted|EPERM|Permission denied/i.test(combined)) {
    return "Access blocked by sandbox."
  }
  if (/NO_SSH_DIR/.test(combined)) return "~/.ssh directory not present."
  return "Directory listing attempted; contents withheld for safety."
}
