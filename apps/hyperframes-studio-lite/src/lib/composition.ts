export type CompositionMeta = {
  compositionId: string | null
  width: number
  height: number
  fps: number
  duration: number
  hasTimelineRegistration: boolean
  noTimeline: boolean
}

const META_TAG_RE =
  /<meta[^>]*data-composition-id=["']([^"']+)["'][^>]*>/i
const NO_TIMELINE_RE = /data-no-timeline/i
const TIMELINE_RE = /window\.__timelines\s*[\[\.]|__timelines\s*\[/
const CLIP_RE =
  /data-start=["']([\d.]+)["'][^>]*data-duration=["']([\d.]+)["']/gi
const META_DURATION_RE = /data-duration=["']([\d.]+)["']/i
const META_FPS_RE = /data-fps=["']([\d.]+)["']/i
const META_WIDTH_RE = /data-width=["'](\d+)["']/i
const META_HEIGHT_RE = /data-height=["'](\d+)["']/i

export function parseCompositionMeta(html: string): CompositionMeta {
  const idMatch = META_TAG_RE.exec(html)
  const compositionId = idMatch?.[1] ?? null
  const noTimeline = NO_TIMELINE_RE.test(html)
  const hasTimelineRegistration = TIMELINE_RE.test(html)

  let duration = 0
  const rootDuration = META_DURATION_RE.exec(html)
  if (rootDuration) {
    duration = Number.parseFloat(rootDuration[1])
  }

  let match: RegExpExecArray | null
  const clipRe = new RegExp(CLIP_RE.source, 'gi')
  while ((match = clipRe.exec(html)) !== null) {
    const end = Number.parseFloat(match[1]) + Number.parseFloat(match[2])
    if (end > duration) duration = end
  }

  const fpsMatch = META_FPS_RE.exec(html)
  const fps = fpsMatch ? Number.parseFloat(fpsMatch[1]) : 30
  const widthMatch = META_WIDTH_RE.exec(html)
  const heightMatch = META_HEIGHT_RE.exec(html)

  return {
    compositionId,
    width: widthMatch ? Number.parseInt(widthMatch[1], 10) : 1280,
    height: heightMatch ? Number.parseInt(heightMatch[1], 10) : 720,
    fps,
    duration: Number.isFinite(duration) ? duration : 0,
    hasTimelineRegistration,
    noTimeline,
  }
}

export type CompositionValidation = {
  ok: boolean
  issues: string[]
}

export function validateComposition(html: string): CompositionValidation {
  const meta = parseCompositionMeta(html)
  const issues: string[] = []

  if (!meta.compositionId) {
    issues.push('Missing data-composition-id on the root <meta> tag.')
  }
  if (meta.duration <= 0) {
    issues.push('Could not determine composition duration from clips or meta.')
  }
  if (!meta.noTimeline && !meta.hasTimelineRegistration) {
    issues.push(
      'No window.__timelines registration found (or add data-no-timeline for CSS-only).',
    )
  }

  return { ok: issues.length === 0, issues }
}

/** Rewrite GSAP path for in-browser srcdoc preview (same origin as Vite). */
export function htmlForPreview(html: string, vendorGsapUrl = '/vendor/gsap.min.js'): string {
  return html.replace(/src=["']\.\/gsap\.min\.js["']/g, `src="${vendorGsapUrl}"`)
}

export function formatTimecode(seconds: number, fps: number): string {
  const frame = Math.max(0, Math.floor(seconds * fps))
  const totalFrames = Math.max(1, Math.floor(seconds * fps))
  const s = seconds.toFixed(2)
  return `${s}s · f${frame}/${totalFrames}`
}
