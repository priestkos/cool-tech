export type SrtSettings = {
  filesystem: {
    denyRead: string[]
    allowRead: string[]
    allowWrite: string[]
    denyWrite: string[]
  }
  network: {
    allowedDomains: string[]
    deniedDomains: string[]
  }
}

export type FolderKey = "project" | "tmp" | "ssh" | "documents"

export type PolicyToggles = {
  folders: Record<
    FolderKey,
    {
      read: boolean
      write: boolean
      denyRead: boolean
    }
  >
  allowedDomains: string[]
  deniedDomains: string[]
}

export type PresetId =
  | "read-ssh"
  | "curl-allowed"
  | "curl-blocked"
  | "write-tmp"
  | "write-outside"

export type PresetDefinition = {
  id: PresetId
  label: string
  shellCommand: string
  kind: "read" | "network" | "write"
}

export type RunResult = {
  presetId: PresetId
  command: string
  allowed: boolean
  reason: string
  durationMs: number
  mode: "real" | "simulated"
  stdout: string
  stderr: string
}
