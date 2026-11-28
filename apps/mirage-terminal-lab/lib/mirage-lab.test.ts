import { describe, expect, test } from "bun:test"
import {
  FIXTURE_FILES,
  MirageLab,
  PRESETS,
  populateRamMount,
  presetsForProfile,
  stepCommandHistory,
  summarize,
  withFreshLab,
} from "./mirage-lab.ts"
import { MountMode, RAMVFS } from "@struktoai/mirage-browser"
import { PathSpec } from "@struktoai/mirage-core/types"

describe("mirage terminal lab", () => {
  test("grep across mounts finds fixture files", async () => {
    await withFreshLab(async (lab) => {
      const out = await lab.run("grep -rl invoice /docs /s3 /data", "admin")
      expect(out.exitCode).toBe(0)
      const paths = out.stdout.trim().split("\n").sort()
      expect(paths.some((p) => p.includes("/docs/"))).toBe(true)
      expect(paths.some((p) => p.includes("/s3/"))).toBe(true)
      expect(paths.some((p) => p.includes("/data/"))).toBe(true)
    })
  })

  test("pipe and redirect writes to /scratch and reads back", async () => {
    await withFreshLab(async (lab) => {
      const pipe = await lab.run('echo "lab" | tee /scratch/pipe.txt', "admin")
      expect(pipe.exitCode).toBe(0)
      const read = await lab.run("cat /scratch/pipe.txt", "admin")
      expect(read.stdout.trim()).toBe("lab")
    })
  })

  test("writing to read-only /s3 mount fails", async () => {
    await withFreshLab(async (lab) => {
      const out = await lab.run('echo "hack" > /s3/hacked.txt', "admin")
      expect(out.exitCode).not.toBe(0)
      expect(out.stderr.toLowerCase()).toMatch(/read-only|permission|denied|error/)
    })
  })

  test("hidden path invisible to analyst but visible to admin", async () => {
    await withFreshLab(async (lab) => {
      const analyst = await lab.run("cat /s3/secrets/aws.txt", "analyst")
      expect(analyst.stderr).toMatch(/No such file or directory/)
      const admin = await lab.run("cat /s3/secrets/aws.txt", "admin")
      expect(admin.exitCode).toBe(0)
      expect(admin.stdout).toContain("rotated-key")
    })
  })

  test("denied command rejected for analyst, allowed for admin", async () => {
    await withFreshLab(async (lab) => {
      await lab.run('echo "x" > /scratch/tmp.txt', "admin")
      const denied = await lab.run("rm /scratch/tmp.txt", "analyst")
      expect(denied.exitCode).toBe(126)
      expect(denied.allowed).toBe(false)
      const allowed = await lab.run("rm /scratch/tmp.txt", "admin")
      expect(allowed.exitCode).toBe(0)
    })
  })

  test("command log records allowed and denied commands", async () => {
    await withFreshLab(async (lab) => {
      await lab.run("ls /docs", "admin")
      await lab.run("rm /scratch/nope", "analyst")
      const allowed = lab.commandLog.filter((e) => e.allowed)
      const denied = lab.commandLog.filter((e) => !e.allowed)
      expect(allowed.length).toBeGreaterThan(0)
      expect(denied.length).toBeGreaterThan(0)
    })
  })

  test("curl cannot reach the network at runtime", async () => {
    await withFreshLab(async (lab) => {
      const out = await lab.run("curl -s https://example.com", "admin")
      expect(out.exitCode).not.toBe(0)
      expect(out.stdout.trim()).toBe("")
    })
  })
})

describe("summarize", () => {
  test("collapses whitespace, trims, and truncates past 160 with one ellipsis", () => {
    expect(summarize("  hello \n\n  world \t there  ")).toBe("hello world there")
    const exact = "a".repeat(160)
    expect(summarize(exact)).toBe(exact)
    expect(summarize(exact).length).toBe(160)
    const over = "b".repeat(161)
    const truncated = summarize(over)
    expect(truncated).toBe(`${"b".repeat(160)}\u2026`)
    expect(truncated.endsWith("\u2026")).toBe(true)
    expect(truncated.length).toBe(161)
    expect(truncated.slice(0, -1).includes("\u2026")).toBe(false)
  })
})

describe("profile permissions", () => {
  test("intern hides /data and secrets, may use /scratch, and missing files stay allowed", async () => {
    await withFreshLab(async (lab) => {
      const analystData = await lab.run("cat /data/records.json", "analyst")
      expect(analystData.exitCode).toBe(0)
      expect(analystData.stdout).toContain("invoice")
      expect(analystData.allowed).toBe(true)

      const internData = await lab.run("cat /data/records.json", "intern")
      expect(internData.stdout).not.toContain("invoice")
      expect(internData.stderr).toMatch(/No such file or directory/)
      expect(internData.exitCode).not.toBe(126)
      expect(internData.allowed).toBe(true)

      const internSecret = await lab.run("cat /s3/secrets/aws.txt", "intern")
      expect(internSecret.stdout.trim()).toBe("")
      expect(internSecret.stderr).toMatch(/No such file or directory/)
      expect(internSecret.exitCode).not.toBe(126)
      expect(internSecret.allowed).toBe(true)

      const billing = await lab.run("cat /s3/billing.csv", "intern")
      expect(billing.exitCode).toBe(0)
      expect(billing.stdout).toContain("paid")
      expect(billing.allowed).toBe(true)

      const write = await lab.run("echo intern > /scratch/note.txt", "intern")
      expect(write.exitCode).toBe(0)
      expect(write.allowed).toBe(true)
      const readBack = await lab.run("cat /scratch/note.txt", "intern")
      expect(readBack.exitCode).toBe(0)
      expect(readBack.stdout.trim()).toBe("intern")

      const removed = await lab.run("rm /scratch/note.txt", "intern")
      expect(removed.exitCode).toBe(126)
      expect(removed.allowed).toBe(false)
      if (removed.decision !== null) {
        expect(removed.decision.kind).toBe("deny")
      }

      const missing = await lab.run("cat /docs/no-such-file", "admin")
      expect(missing.exitCode).not.toBe(0)
      expect(missing.exitCode).not.toBe(126)
      expect(missing.allowed).toBe(true)
    })
  })
})

describe("command log and trace", () => {
  test("long echo is truncated in the command log summary", async () => {
    await withFreshLab(async (lab) => {
      const token = "x".repeat(200)
      const out = await lab.run(`echo ${token}`, "admin")
      expect(out.stdout.length).toBeGreaterThan(160)
      const entry = lab.commandLog[lab.commandLog.length - 1]
      expect(entry).toBeDefined()
      expect(entry!.stdoutSummary.endsWith("\u2026")).toBe(true)
      expect(entry!.stdoutSummary.length).toBe(161)
      expect(entry!.stdoutSummary.startsWith("x")).toBe(true)
      expect(entry!.stdoutSummary).toBe(summarize(out.stdout))
    })
  })

  test("exportTraceJson matches command log ids and a timestamped note", async () => {
    await withFreshLab(async (lab) => {
      await lab.run("ls /docs", "admin")
      await lab.run("echo hi", "analyst")
      const parsed = JSON.parse(lab.exportTraceJson()) as {
        generatedAt: string
        note: string
        commands: { id: string }[]
      }
      expect(parsed.commands.map((command) => command.id)).toEqual(
        lab.commandLog.map((command) => command.id),
      )
      expect(parsed.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      expect(typeof parsed.note).toBe("string")
      expect(parsed.note.length).toBeGreaterThan(0)
    })
  })
})

describe("listMountTree", () => {
  test("parses admin find output into sorted, confined mount nodes", async () => {
    await withFreshLab(async (lab) => {
      const tree = await lab.listMountTree()
      expect(tree.map((node) => node.path)).toEqual(["/docs", "/s3", "/data", "/scratch"])

      for (const node of tree) {
        if (node.path === "/scratch") {
          expect(node.mode).toBe("write")
        } else {
          expect(node.mode).toBe("read")
        }
        expect(node.kind).toBe("mount")
        const childPaths = (node.children ?? []).map((child) => child.path)
        expect(childPaths).toEqual([...childPaths].sort((a, b) => a.localeCompare(b)))
        for (const childPath of childPaths) {
          expect(childPath.startsWith(`${node.path}/`)).toBe(true)
        }
      }

      const known = [
        ["/docs", "/docs/readme.md", "read"],
        ["/docs", "/docs/notes/invoice.md", "read"],
        ["/docs", "/docs/notes/meeting.md", "read"],
        ["/s3", "/s3/billing.csv", "read"],
        ["/s3", "/s3/customers.json", "read"],
        ["/s3", "/s3/secrets/aws.txt", "read"],
        ["/data", "/data/records.json", "read"],
        ["/data", "/data/summary.txt", "read"],
      ] as const

      for (const [root, path, mode] of known) {
        const child = tree.find((node) => node.path === root)?.children?.find((item) => item.path === path)
        expect(child).toBeDefined()
        expect(child?.kind).toBe("file")
        expect(child?.mode).toBe(mode)
      }

      const docsChildren = tree.find((node) => node.path === "/docs")?.children ?? []
      expect(docsChildren.some((child) => child.path === "/docs/notes")).toBe(true)

      const findLog = lab.commandLog.find((entry) => entry.command.startsWith("find "))
      expect(findLog?.profile).toBe("admin")
    })
  })
})

describe("presets and history", () => {
  test("presetsForProfile filters by profile and leaves admin unrestricted presets", () => {
    const analyst = presetsForProfile("analyst")
    const analystIds = analyst.map((preset) => preset.id)
    expect(analystIds).toContain("blocked-analyst-rm")
    expect(analystIds).toContain("grep-invoice")
    expect(analystIds).not.toContain("blocked-intern-curl")

    const intern = presetsForProfile("intern")
    const internIds = intern.map((preset) => preset.id)
    expect(internIds).toContain("blocked-intern-curl")
    expect(internIds).toContain("grep-invoice")
    expect(internIds).not.toContain("blocked-analyst-rm")

    const admin = presetsForProfile("admin")
    expect(admin.length).toBeGreaterThan(0)
    for (const preset of admin) {
      expect(preset.profile).toBeUndefined()
    }
    expect(PRESETS.some((preset) => preset.profile === "analyst")).toBe(true)
  })

  test("stepCommandHistory walks history and ignores an empty list", () => {
    expect(stepCommandHistory([], -1, "ArrowUp")).toBeNull()
    expect(stepCommandHistory([], 0, "ArrowDown")).toBeNull()

    const history = ["a", "b"] as const
    expect(stepCommandHistory(history, -1, "ArrowUp")).toEqual({ historyIdx: 1, input: "b" })
    expect(stepCommandHistory(history, 1, "ArrowUp")).toEqual({ historyIdx: 0, input: "a" })
    expect(stepCommandHistory(history, 0, "ArrowUp")).toEqual({ historyIdx: 0, input: "a" })
    expect(stepCommandHistory(history, 0, "ArrowDown")).toEqual({ historyIdx: 1, input: "b" })
    expect(stepCommandHistory(history, 1, "ArrowDown")).toEqual({ historyIdx: -1, input: "" })
    expect(stepCommandHistory(history, -1, "ArrowDown")).toEqual({ historyIdx: -1, input: "" })
  })
})

describe("populateRamMount", () => {
  test("writes nested directories and root files that read back", async () => {
    const vfs = new RAMVFS()
    await populateRamMount(vfs, {
      "///nested/dir/note.txt": "hello",
      "root.txt": "top",
    })
    const decoder = new TextDecoder()
    const readText = async (virtual: string) => {
      const vfsPath = virtual.replace(/^\/+/, "")
      const bytes = await vfs.read(new PathSpec({ virtual, directory: virtual, vfsPath }))
      expect(bytes).toBeInstanceOf(Uint8Array)
      return decoder.decode(bytes as Uint8Array)
    }
    expect(await readText("/nested/dir/note.txt")).toBe("hello")
    expect(await readText("/root.txt")).toBe("top")
  })
})