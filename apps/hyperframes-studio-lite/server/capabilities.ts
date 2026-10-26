import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

export type Capabilities = {
  hyperframesVersion: string
  ffmpeg: boolean
  ffmpegDetail: string | null
  chrome: boolean
  chromeDetail: string | null
  canRender: boolean
  renderNotice: string | null
}

type DoctorCheck = { name: string; ok: boolean; detail?: string; hint?: string }

type DoctorJson = {
  ok: boolean
  checks: DoctorCheck[]
  _meta?: { version?: string }
}

export async function getCapabilities(): Promise<Capabilities> {
  const cli = path.join(root, 'node_modules/hyperframes/bin/hyperframes.mjs')
  const proc = Bun.spawn(
    ['bun', cli, 'doctor', '--json'],
    {
      cwd: root,
      env: {
        ...process.env,
        HYPERFRAMES_NO_TELEMETRY: '1',
        DO_NOT_TRACK: '1',
      },
      stdout: 'pipe',
      stderr: 'pipe',
    },
  )

  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ])
  await proc.exited

  const jsonText = stdout.includes('{') ? stdout.slice(stdout.indexOf('{')) : stdout
  let doctor: DoctorJson | null = null
  try {
    doctor = JSON.parse(jsonText) as DoctorJson
  } catch {
    doctor = null
  }

  const checks = doctor?.checks ?? []
  const ffmpegCheck = checks.find((c) => c.name === 'FFmpeg')
  const chromeCheck = checks.find((c) => c.name === 'Chrome')
  const version =
    doctor?._meta?.version ??
    checks.find((c) => c.name === 'Version')?.detail?.split(' ')[0] ??
    'unknown'

  const ffmpeg = ffmpegCheck?.ok === true
  const chrome = chromeCheck?.ok === true
  const canRender = ffmpeg && chrome

  let renderNotice: string | null = null
  if (!canRender) {
    if (!ffmpeg && !chrome) {
      renderNotice =
        'Render unavailable: FFmpeg not found. Install it, or run `bunx hyperframes browser ensure` for Chrome.'
    } else if (!ffmpeg) {
      renderNotice = 'Render unavailable: FFmpeg not found. Install FFmpeg on your PATH.'
    } else {
      renderNotice =
        'Render unavailable: Chrome not found. Install Google Chrome or run `bunx hyperframes browser ensure`.'
    }
  }

  if (!doctor && stderr) {
    renderNotice = renderNotice ?? `Could not read HyperFrames doctor output.`
  }

  return {
    hyperframesVersion: version,
    ffmpeg,
    ffmpegDetail: ffmpegCheck?.detail ?? null,
    chrome,
    chromeDetail: chromeCheck?.detail ?? null,
    canRender,
    renderNotice,
  }
}
