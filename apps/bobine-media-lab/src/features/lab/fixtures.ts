export const FIXTURES = {
  videoMp4: "/fixtures/test-clip.mp4",
  audioMp3: "/fixtures/test-audio.mp3",
  captionsVtt: "/fixtures/test-captions.vtt",
  hlsPlaylist: "/fixtures/hls/playlist.m3u8",
} as const

export const SHARED_VIDEO_PROPS = {
  src: FIXTURES.videoMp4,
  poster: undefined,
  preload: "metadata" as const,
  crossOrigin: undefined,
}