export function shouldUseHlsLoader(src: string | undefined): boolean {
  if (!src) return false
  try {
    const path = new URL(src, "http://local").pathname
    return path.endsWith(".m3u8")
  } catch {
    return src.endsWith(".m3u8")
  }
}

let hlsModuleLoaded = false

export function getHlsModuleLoadedFlag(): boolean {
  return hlsModuleLoaded
}

export function resetHlsModuleLoadedFlagForTests(): void {
  hlsModuleLoaded = false
}

export type HlsLoadEvent = {
  at: string
  message: string
}

const loadLog: HlsLoadEvent[] = []

export function getHlsLoadLog(): readonly HlsLoadEvent[] {
  return loadLog
}

export function clearHlsLoadLog(): void {
  loadLog.length = 0
}

function pushLog(message: string) {
  loadLog.push({ at: new Date().toISOString(), message })
}

export async function attachHlsPlayback(
  video: HTMLVideoElement,
  src: string
): Promise<{ ok: boolean; error?: string }> {
  if (!shouldUseHlsLoader(src)) {
    return { ok: false, error: "not-hls" }
  }

  pushLog("Dynamic import: hls.js (lazy chunk)")
  const { default: Hls } = await import("hls.js")
  hlsModuleLoaded = true
  pushLog(`hls.js module resolved (v${Hls.version ?? "unknown"})`)

  if (Hls.isSupported()) {
    const hls = new Hls()
    hls.loadSource(src)
    hls.attachMedia(video)
    pushLog("HLS source attached via MSE")
    return { ok: true }
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = src
    pushLog("Native HLS fallback")
    return { ok: true }
  }

  return { ok: false, error: "unsupported" }
}