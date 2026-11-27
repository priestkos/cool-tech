import { describe, expect, test } from "bun:test"
import {
  FIXTURE_FILES,
  MirageLab,
  populateRamMount,
  withFreshLab,
} from "./mirage-lab.ts"
import { MountMode, RAMVFS } from "@struktoai/mirage-browser"

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