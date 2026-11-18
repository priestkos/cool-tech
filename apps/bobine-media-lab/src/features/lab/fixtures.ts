import type { VideoTrack } from "bobinejs"

export const FIXTURES = {
  videoMp4: "/fixtures/test-clip.mp4",
  audioMp3: "/fixtures/test-audio.mp3",
  captionsVtt: "/fixtures/test-captions.vtt",
  hlsPlaylist: "/fixtures/hls/playlist.m3u8",
} as const

export const captionTracks: VideoTrack[] = [
  {
    src: FIXTURES.captionsVtt,
    label: "English",
    srcLang: "en",
    kind: "captions",
    default: true,
  },
]

export const SHARED_VIDEO_PROPS = {
  src: FIXTURES.videoMp4,
  preload: "metadata" as const,
  playsInline: true,
}