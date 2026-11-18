import { hlsLoader as bobineHlsLoader } from "bobinejs/hls"
import type { MediaSourceLoader } from "bobinejs"

export type HlsLogEntry = { at: string; message: string }

const hlsLoadLog: HlsLogEntry[] = []
let moduleTouched = false

const M3U8_PATTERN = /\.m3u8($|\?)/i

export function shouldUseHlsLoader(src: string | undefined): boolean {
  return Boolean(src && M3U8_PATTERN.test(src))
}

export function getHlsLoadLog(): readonly HlsLogEntry[] {
  return hlsLoadLog
}

export function getHlsModuleTouchedFlag(): boolean {
  return moduleTouched
}

export function resetHlsTelemetryForTests() {
  hlsLoadLog.length = 0
  moduleTouched = false
}

export const instrumentedHlsLoader: MediaSourceLoader = (media, src) => {
  if (shouldUseHlsLoader(src)) {
    moduleTouched = true
    hlsLoadLog.push({
      at: new Date().toISOString(),
      message: `bobinejs/hls hlsLoader invoked for ${src}`,
    })
  }
  return bobineHlsLoader(media, src)
}