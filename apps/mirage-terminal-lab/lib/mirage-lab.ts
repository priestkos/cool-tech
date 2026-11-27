import {
  MountMode,
  RAMVFS,
  Workspace,
} from "@struktoai/mirage-browser"
import type { Session } from "@struktoai/mirage-browser"
import { SessionProfile } from "@struktoai/mirage-core/policy/profile"
import { PathSpec } from "@struktoai/mirage-core/types"
import type { PolicyDecision } from "@struktoai/mirage-core/types"
import type { ShellExecution } from "@struktoai/mirage-core/workspace/shell_execution"
import type { ExecuteResult } from "@struktoai/mirage-core/workspace/workspace/types"

export type ProfileId = "analyst" | "intern" | "admin"

export interface MountTreeNode {
  path: string
  mode: string
  kind: "mount" | "dir" | "file"
  children?: MountTreeNode[]
}

export interface CommandLogEntry {
  id: string
  profile: ProfileId
  sessionId: string
  command: string
  exitCode: number
  allowed: boolean
  stdoutSummary: string
  stderrSummary: string
  durationMs: number
  decision: PolicyDecision | null
}

export interface PresetCommand {
  id: string
  label: string
  command: string
  profile?: ProfileId
}

export interface RunOutput {
  stdout: string
  stderr: string
  exitCode: number
  allowed: boolean
  decision: PolicyDecision | null
  durationMs: number
}

const encoder = new TextEncoder()

function ramPath(virtual: string): PathSpec {
  const vfsPath = virtual.replace(/^\/+/, "")
  return new PathSpec({ virtual, directory: virtual, vfsPath })
}

export async function populateRamMount(
  vfs: RAMVFS,
  files: Record<string, string>,
): Promise<void> {
  for (const [mountRelative, content] of Object.entries(files)) {
    const rel = mountRelative.replace(/^\/+/, "")
    const parts = rel.split("/")
    for (let i = 1; i < parts.length; i++) {
      await vfs.mkdir(ramPath("/" + parts.slice(0, i).join("/")), true)
    }
    await vfs.write(ramPath("/" + rel), encoder.encode(content))
  }
}

export const FIXTURE_FILES = {
  docs: {
    "/readme.md": "# Lab notes\nSee invoice workflow in notes/invoice.md\n",
    "/notes/invoice.md": "invoice #1042 for Q4 close\n",
    "/notes/meeting.md": "Discuss billing with finance\n",
  },
  s3: {
    "/billing.csv": "id,status,amount\n1,paid,1200\n2,pending,400\n3,paid,90\n",
    "/customers.json": '{"name":"acme","tags":["invoice"]}\n',
    "/secrets/aws.txt": "rotated-key-LOCAL-ONLY\n",
  },
  data: {
    "/records.json": '[{"id":1,"kind":"invoice","paid":true}]\n',
    "/summary.txt": "two paid rows in billing.csv\n",
  },
} as const

async function buildFixtureMounts() {
  const docs = new RAMVFS()
  const s3 = new RAMVFS()
  const data = new RAMVFS()
  const scratch = new RAMVFS()
  await populateRamMount(docs, FIXTURE_FILES.docs)
  await populateRamMount(s3, FIXTURE_FILES.s3)
  await populateRamMount(data, FIXTURE_FILES.data)
  return { docs, s3, data, scratch }
}

export function profileDefinitions(): Record<ProfileId, ReturnType<typeof SessionProfile>> {
  return {
    analyst: SessionProfile(
      {
        paths: { hide: ["/s3/secrets"] },
        commands: { rm: "deny", curl: "deny" },
      },
      "analyst",
    ),
    intern: SessionProfile(
      {
        paths: { hide: ["/s3/secrets", "/data"] },
        commands: { rm: "deny" },
        mounts: { "/s3": "read" },
      },
      "intern",
    ),
    admin: SessionProfile({ commands: { "*": "allow" } }, "admin"),
  }
}

export async function createLabWorkspace(): Promise<Workspace> {
  const { docs, s3, data, scratch } = await buildFixtureMounts()
  return new Workspace(
    {
      "/docs": [docs, MountMode.READ],
      "/s3": [s3, MountMode.READ],
      "/data": [data, MountMode.READ],
      "/scratch": [scratch, MountMode.WRITE],
    },
    {
      env: { USER: "analyst", HOME: "/scratch" },
      network: false,
      profiles: profileDefinitions(),
    },
  )
}

export const PRESETS: PresetCommand[] = [
  {
    id: "grep-invoice",
    label: "grep -rl invoice across mounts",
    command: "grep -rl invoice /docs /s3 /data",
  },
  {
    id: "pipe-wc",
    label: "count paid rows in billing.csv",
    command: "cat /s3/billing.csv | grep paid | wc -l",
  },
  {
    id: "scratch-me",
    label: 'echo "$USER" > /scratch/me.txt',
    command: 'echo "$USER" > /scratch/me.txt',
  },
  {
    id: "find-data",
    label: "find /data -name '*.json'",
    command: "find /data -name '*.json'",
  },
  {
    id: "head-billing",
    label: "head -n 2 /s3/billing.csv",
    command: "head -n 2 /s3/billing.csv",
  },
  {
    id: "multi-mount",
    label: "wc -l /docs/notes/invoice.md /data/records.json",
    command: "wc -l /docs/notes/invoice.md /data/records.json",
  },
  {
    id: "blocked-analyst-rm",
    label: "[analyst] try rm (denied)",
    command: "rm /scratch/me.txt",
    profile: "analyst",
  },
  {
    id: "blocked-intern-curl",
    label: "[intern] try curl (denied)",
    command: "curl https://example.com",
    profile: "intern",
  },
  {
    id: "hidden-secrets-analyst",
    label: "[analyst] cat hidden /s3/secrets",
    command: "cat /s3/secrets/aws.txt",
    profile: "analyst",
  },
]

async function resolveShell(
  exec: ExecuteResult | ShellExecution,
): Promise<ExecuteResult> {
  if ("exitCode" in exec) return exec
  return exec.wait()
}

export class MirageLab {
  private ws: Workspace | null = null
  private sessions = new Map<ProfileId, Session>()
  private activeProfile: ProfileId = "analyst"
  readonly commandLog: CommandLogEntry[] = []
  private logSeq = 0

  async init(): Promise<void> {
    this.ws = await createLabWorkspace()
    this.sessions.clear()
    for (const id of ["analyst", "intern", "admin"] as const) {
      this.sessions.set(id, await this.ws.session(`lab-${id}`, { profile: id }))
    }
  }

  get workspace(): Workspace {
    if (!this.ws) throw new Error("MirageLab not initialized")
    return this.ws
  }

  get profile(): ProfileId {
    return this.activeProfile
  }

  setProfile(id: ProfileId): void {
    this.activeProfile = id
  }

  sessionFor(profile: ProfileId = this.activeProfile): Session {
    const s = this.sessions.get(profile)
    if (!s) throw new Error(`missing session ${profile}`)
    return s
  }

  async run(
    command: string,
    profile: ProfileId = this.activeProfile,
  ): Promise<RunOutput> {
    const session = this.sessionFor(profile)
    const started = performance.now()
    const raw = await session.shell(command)
    const result = await resolveShell(raw)
    const durationMs = Math.round(performance.now() - started)
    const allowed = result.exitCode !== 126 && result.decision?.kind !== "deny"
    const entry: CommandLogEntry = {
      id: `log-${++this.logSeq}`,
      profile,
      sessionId: `lab-${profile}`,
      command,
      exitCode: result.exitCode,
      allowed,
      stdoutSummary: summarize(result.stdoutText),
      stderrSummary: summarize(result.stderrText),
      durationMs,
      decision: result.decision,
    }
    this.commandLog.push(entry)
    return {
      stdout: result.stdoutText,
      stderr: result.stderrText,
      exitCode: result.exitCode,
      allowed,
      decision: result.decision,
      durationMs,
    }
  }

  async listMountTree(): Promise<MountTreeNode[]> {
    const listing = await this.run(
      "find /docs /s3 /data /scratch -maxdepth 3 2>/dev/null",
      "admin",
    )
    const paths = listing.stdout
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .sort()

    const roots: MountTreeNode[] = [
      { path: "/docs", mode: "read", kind: "mount", children: [] },
      { path: "/s3", mode: "read", kind: "mount", children: [] },
      { path: "/data", mode: "read", kind: "mount", children: [] },
      { path: "/scratch", mode: "write", kind: "mount", children: [] },
    ]
    const rootByPrefix = Object.fromEntries(roots.map((r) => [r.path, r])) as Record<
      string,
      MountTreeNode
    >

    for (const p of paths) {
      const mount = (["/docs", "/s3", "/data", "/scratch"] as const).find(
        (m) => p === m || p.startsWith(m + "/"),
      )
      if (!mount) continue
      const node: MountTreeNode = {
        path: p,
        mode: mount === "/scratch" ? "write" : "read",
        kind: p === mount ? "mount" : "file",
      }
      rootByPrefix[mount].children = rootByPrefix[mount].children ?? []
      if (p !== mount) rootByPrefix[mount].children!.push(node)
    }
    for (const r of roots) {
      r.children?.sort((a, b) => a.path.localeCompare(b.path))
    }
    return roots
  }

  exportTraceJson(): string {
    return JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        note:
          "Mirage 0.1.0 does not expose a single browser export helper in this build; this file is assembled at the SDK call boundary (shell results + commandLog).",
        commands: this.commandLog,
      },
      null,
      2,
    )
  }
}

function summarize(text: string, max = 160): string {
  const one = text.replace(/\s+/g, " ").trim()
  return one.length <= max ? one : `${one.slice(0, max)}…`
}

export async function withFreshLab<T>(
  fn: (lab: MirageLab) => Promise<T>,
): Promise<T> {
  const lab = new MirageLab()
  await lab.init()
  try {
    return await fn(lab)
  } finally {
    await lab.workspace.close()
  }
}