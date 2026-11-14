import { useCallback, useEffect, useState } from "react"
import type { PlaybackRate } from "./shortcuts"
import { PLAYBACK_RATES } from "./shortcuts"

export type MediaElementState = {
  playing: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  playbackRate: PlaybackRate
  captionsOn: boolean
}

export function useMediaElement(
  mediaRef: React.RefObject<HTMLMediaElement | null>,
  options: { initialCaptions?: boolean } = {}
) {
  const [state, setState] = useState<MediaElementState>({
    playing: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
    captionsOn: options.initialCaptions ?? false,
  })

  const syncFromElement = useCallback(() => {
    const el = mediaRef.current
    if (!el) return
    setState({
      playing: !el.paused && !el.ended,
      currentTime: el.currentTime,
      duration: el.duration || 0,
      volume: el.volume,
      muted: el.muted,
      playbackRate: (PLAYBACK_RATES.includes(el.playbackRate as PlaybackRate)
        ? el.playbackRate
        : 1) as PlaybackRate,
      captionsOn: options.initialCaptions ?? state.captionsOn,
    })
  }, [mediaRef, options.initialCaptions, state.captionsOn])

  useEffect(() => {
    const el = mediaRef.current
    if (!el) return

    const onPlay = () => syncFromElement()
    const onPause = () => syncFromElement()
    const onTime = () => syncFromElement()
    const onVolume = () => syncFromElement()
    const onMeta = () => syncFromElement()
    const onRate = () => syncFromElement()

    el.addEventListener("play", onPlay)
    el.addEventListener("pause", onPause)
    el.addEventListener("timeupdate", onTime)
    el.addEventListener("volumechange", onVolume)
    el.addEventListener("loadedmetadata", onMeta)
    el.addEventListener("ratechange", onRate)

    syncFromElement()

    return () => {
      el.removeEventListener("play", onPlay)
      el.removeEventListener("pause", onPause)
      el.removeEventListener("timeupdate", onTime)
      el.removeEventListener("volumechange", onVolume)
      el.removeEventListener("loadedmetadata", onMeta)
      el.removeEventListener("ratechange", onRate)
    }
  }, [mediaRef, syncFromElement])

  const togglePlay = useCallback(() => {
    const el = mediaRef.current
    if (!el) return
    if (el.paused) void el.play()
    else el.pause()
  }, [mediaRef])

  const seekBy = useCallback(
    (delta: number) => {
      const el = mediaRef.current
      if (!el) return
      const next = Math.min(Math.max(0, el.currentTime + delta), el.duration || Infinity)
      el.currentTime = next
    },
    [mediaRef]
  )

  const setVolume = useCallback(
    (next: number) => {
      const el = mediaRef.current
      if (!el) return
      el.volume = Math.min(1, Math.max(0, next))
    },
    [mediaRef]
  )

  const toggleMute = useCallback(() => {
    const el = mediaRef.current
    if (!el) return
    el.muted = !el.muted
  }, [mediaRef])

  const setPlaybackRate = useCallback(
    (rate: PlaybackRate) => {
      const el = mediaRef.current
      if (!el) return
      el.playbackRate = rate
      setState((s) => ({ ...s, playbackRate: rate }))
    },
    [mediaRef]
  )

  const setCaptionsOn = useCallback(
    (on: boolean) => {
      setState((s) => ({ ...s, captionsOn: on }))
      const el = mediaRef.current
      if (!el) return
      for (const track of el.textTracks) {
        if (track.kind === "captions" || track.kind === "subtitles") {
          track.mode = on ? "showing" : "hidden"
        }
      }
    },
    [mediaRef]
  )

  const scrubTo = useCallback(
    (time: number) => {
      const el = mediaRef.current
      if (!el) return
      el.currentTime = time
    },
    [mediaRef]
  )

  return {
    state,
    togglePlay,
    seekBy,
    setVolume,
    toggleMute,
    setPlaybackRate,
    setCaptionsOn,
    scrubTo,
    syncFromElement,
  }
}