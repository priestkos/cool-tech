import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { mkdtemp } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const RENDER_TIMEOUT_MS = 180_000
const LOG_TAIL_CHARS = 4000

export type RenderStatus = 'queued' | 'running' | 'done' | 'error'

export type RenderJob = {
  id: string
  status: RenderStatus
  logTail: string
  error: string | null
  dir: string
  outputPath: string
  startedAt: number
  finishedAt: number | null
}

let activeJob: RenderJob | null = null
const jobs = new Map<string, RenderJob>()

function tailLog(full: string): string {
  if (full.length <= LOG_TAIL_CHARS) return full
  return full.slice(-LOG_TAIL_CHARS)
}

export function getRenderJob(id: string): RenderJob | undefined {
  return jobs.get(id)
}

export function getActiveRenderJob(): RenderJob | null {
  return activeJob
}

export async function startRender(html: string): Promise<
  { ok: true; id: string } | { ok: false; message: string }
> {
  if (activeJob && (activeJob.status === 'queued' || activeJob.status === 'running')) {
    return {
      ok: false,
      message: 'A render is already in progress. Wait for it to finish before starting another.',
    }
  }

  const id = crypto.randomUUID()
  const dir = await mkdtemp(path.join(os.tmpdir(), 'hyperframes-studio-'))
  const outputPath = path.join(dir, 'out.mp4')
  const gsapSrc = path.join(root, 'node_modules/gsap/dist/gsap.min.js')
  const gsapDest = path.join(dir, 'gsap.min.js')

  await mkdir(dir, { recursive: true })
  await copyFile(gsapSrc, gsapDest)
  await writeFile(path.join(dir, 'index.html'), html, 'utf8')

  const job: RenderJob = {
    id,
    status: 'queued',
    logTail: '',
    error: null,
    dir,
    outputPath,
    startedAt: Date.now(),
    finishedAt: null,
  }
  jobs.set(id, job)
  activeJob = job

  void runRender(job)
  return { ok: true, id }
}

async function runRender(job: RenderJob) {
  job.status = 'running'
  const cli = path.join(root, 'node_modules/hyperframes/bin/hyperframes.mjs')
  const args = [
    cli,
    'render',
    job.dir,
    '-o',
    job.outputPath,
    '--quality',
    'draft',
    '--workers',
    '1',
    '--quiet',
  ]

  const proc = Bun.spawn(['bun', ...args], {
    cwd: root,
    env: {
      ...process.env,
      HYPERFRAMES_NO_TELEMETRY: '1',
      DO_NOT_TRACK: '1',
    },
    stdout: 'pipe',
    stderr: 'pipe',
  })

  let log = ''
  const append = (chunk: string) => {
    log += chunk
    job.logTail = tailLog(log)
  }

  const readStream = async (stream: ReadableStream<Uint8Array> | null) => {
    if (!stream) return
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      append(decoder.decode(value))
    }
  }

  const timeout = setTimeout(() => {
    proc.kill()
    job.status = 'error'
    job.error = 'Render timed out after 180 seconds.'
    job.finishedAt = Date.now()
    activeJob = null
  }, RENDER_TIMEOUT_MS)

  await Promise.all([readStream(proc.stdout), readStream(proc.stderr)])
  const exitCode = await proc.exited
  clearTimeout(timeout)

  if (job.status === 'error') return

  if (exitCode !== 0) {
    job.status = 'error'
    job.error =
      log.trim().split('\n').filter(Boolean).pop() ??
      `hyperframes render exited with code ${exitCode}`
    job.finishedAt = Date.now()
    activeJob = null
    return
  }

  const file = Bun.file(job.outputPath)
  if (!(await file.exists())) {
    job.status = 'error'
    job.error = 'Render finished but out.mp4 was not found.'
    job.finishedAt = Date.now()
    activeJob = null
    return
  }

  job.status = 'done'
  job.finishedAt = Date.now()
  activeJob = null
}
