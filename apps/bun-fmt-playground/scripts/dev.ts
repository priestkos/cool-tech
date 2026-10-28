const API_PORT = process.env.BUN_FMT_API_PORT ?? "3944"

const server = Bun.spawn(["bun", "server/index.ts"], {
  cwd: import.meta.dir + "/..",
  env: { ...process.env, BUN_FMT_API_PORT: API_PORT },
  stdout: "inherit",
  stderr: "inherit",
})

const vite = Bun.spawn(["bun", "run", "vite"], {
  cwd: import.meta.dir + "/..",
  env: { ...process.env, BUN_FMT_API_PORT: API_PORT },
  stdout: "inherit",
  stderr: "inherit",
})

const shutdown = () => {
  server.kill()
  vite.kill()
  process.exit(0)
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)

await Promise.race([server.exited, vite.exited])
shutdown()
