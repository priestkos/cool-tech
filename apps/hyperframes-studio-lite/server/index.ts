import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getCapabilities } from './capabilities'
import { getRenderJob, startRender } from './render-manager'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const port = Number(process.env.HYPERFRAMES_API_PORT ?? 3847)
const gsapPath = path.join(root, 'node_modules/gsap/dist/gsap.min.js')

const server = Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url)

    if (url.pathname === '/vendor/gsap.min.js') {
      const file = Bun.file(gsapPath)
      if (!(await file.exists())) {
        return new Response('GSAP not installed', { status: 404 })
      }
      return new Response(file, {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }

    if (url.pathname === '/api/capabilities' && req.method === 'GET') {
      const caps = await getCapabilities()
      return Response.json(caps)
    }

    if (url.pathname === '/api/render' && req.method === 'POST') {
      let body: { html?: string }
      try {
        body = (await req.json()) as { html?: string }
      } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
      }
      if (!body.html || typeof body.html !== 'string') {
        return Response.json({ error: 'Missing html field' }, { status: 400 })
      }
      const result = await startRender(body.html)
      if (!result.ok) {
        return Response.json({ error: result.message }, { status: 409 })
      }
      return Response.json({ id: result.id })
    }

    const renderMatch = /^\/api\/render\/([^/]+)$/.exec(url.pathname)
    if (renderMatch && req.method === 'GET') {
      const job = getRenderJob(renderMatch[1])
      if (!job) {
        return Response.json({ error: 'Unknown render id' }, { status: 404 })
      }
      return Response.json({
        id: job.id,
        status: job.status,
        logTail: job.logTail,
        error: job.error,
      })
    }

    const videoMatch = /^\/api\/render\/([^/]+)\/video$/.exec(url.pathname)
    if (videoMatch && req.method === 'GET') {
      const job = getRenderJob(videoMatch[1])
      if (!job) {
        return new Response('Not found', { status: 404 })
      }
      if (job.status !== 'done') {
        return new Response('Render not ready', { status: 409 })
      }
      const file = Bun.file(job.outputPath)
      if (!(await file.exists())) {
        return new Response('Missing output file', { status: 404 })
      }
      return new Response(file, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Disposition': `inline; filename="composition-${job.id}.mp4"`,
        },
      })
    }

    return new Response('Not found', { status: 404 })
  },
})

console.log(`[hyperframes-studio-lite] API on http://localhost:${server.port}`)
