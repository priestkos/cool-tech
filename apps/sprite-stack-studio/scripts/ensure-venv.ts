import { existsSync } from "node:fs"
import path from "node:path"

const appRoot = path.resolve(import.meta.dir, "..")
const venvPython = path.join(appRoot, ".venv/bin/python")
const requirements = path.join(appRoot, "requirements.txt")

if (existsSync(venvPython)) {
  process.exit(0)
}

console.log("Creating Python venv and installing pinned Pillow + NumPy…")
const venv = Bun.spawn(["python3", "-m", "venv", path.join(appRoot, ".venv")], {
  cwd: appRoot,
  stdout: "inherit",
  stderr: "inherit",
})
await venv.exited
if (venv.exitCode !== 0) process.exit(venv.exitCode ?? 1)

const pip = Bun.spawn([venvPython, "-m", "pip", "install", "-r", requirements], {
  cwd: appRoot,
  stdout: "inherit",
  stderr: "inherit",
})
await pip.exited
process.exit(pip.exitCode ?? 0)