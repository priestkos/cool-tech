import type { PolicyToggles, SrtSettings } from "./types.ts"

export const defaultPolicyToggles = (): PolicyToggles => ({
  folders: {
    project: { read: true, write: true, denyRead: false },
    tmp: { read: true, write: false, denyRead: false },
    ssh: { read: false, write: false, denyRead: true },
    documents: { read: false, write: false, denyRead: false },
  },
  allowedDomains: ["github.com"],
  deniedDomains: [],
})

const folderPaths: Record<keyof PolicyToggles["folders"], string> = {
  project: ".",
  tmp: "/tmp",
  ssh: "~/.ssh",
  documents: "~/Documents",
}

export function buildSrtSettings(toggles: PolicyToggles): SrtSettings {
  const denyRead: string[] = []
  const allowRead: string[] = []
  const allowWrite: string[] = []
  const denyWrite: string[] = []

  for (const [key, path] of Object.entries(folderPaths) as [
    keyof PolicyToggles["folders"],
    string,
  ][]) {
    const f = toggles.folders[key]
    if (f.denyRead) {
      denyRead.push(path)
    } else if (f.read) {
      allowRead.push(path)
    }
    if (f.write) {
      allowWrite.push(path)
    }
  }

  return {
    filesystem: {
      denyRead,
      allowRead,
      allowWrite,
      denyWrite,
    },
    network: {
      allowedDomains: [...toggles.allowedDomains],
      deniedDomains: [...toggles.deniedDomains],
    },
  }
}

export function settingsToCliExample(_settings: SrtSettings, cmd = "echo ok"): string {
  return `srt --settings srt-settings.json ${cmd}`
}

export { folderPaths }
