import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type VideoHTMLAttributes,
} from "react"
import { cn } from "@/lib/utils"
import { MediaControls } from "./MediaControls"
import { splitVideoProps, type VideoPlayerOwn } from "./native-props"
import { useKeyboardShortcuts } from "./useKeyboardShortcuts"
import { useMediaElement } from "./useMediaElement"

export type VideoPlayerProps = VideoHTMLAttributes<HTMLVideoElement> & VideoPlayerOwn

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(function VideoPlayer(
  props,
  ref
) {
  const { elementProps, own } = splitVideoProps(props)
  const videoRef = useRef<HTMLVideoElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement)

  const showControls = own.showCustomControls !== false
  const [captionsOn, setCaptionsOn] = useState(false)

  const media = useMediaElement(videoRef, { initialCaptions: captionsOn })

  const toggleCaptions = useCallback(() => {
    const next = !media.state.captionsOn
    media.setCaptionsOn(next)
    setCaptionsOn(next)
    own.onCaptionsChange?.(next)
  }, [media, own])

  const adjustVolume = useCallback(
    (delta: number) => {
      const el = videoRef.current
      if (!el) return
      media.setVolume(el.volume + delta)
    },
    [media]
  )

  const toggleFullscreen = useCallback(async () => {
    const shell = shellRef.current
    if (!shell) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await shell.requestFullscreen()
    }
  }, [])

  const togglePip = useCallback(async () => {
    const el = videoRef.current
    if (!el || !document.pictureInPictureEnabled) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        await el.requestPictureInPicture()
      }
    } catch {
      /* graceful fallback */
    }
  }, [])

  useKeyboardShortcuts(
    showControls,
    {
      togglePlay: media.togglePlay,
      seekBy: media.seekBy,
      adjustVolume,
      toggleMute: media.toggleMute,
      toggleFullscreen,
      toggleCaptions,
      toggleHelp: () => own.onToggleHelp?.(),
    },
    shellRef
  )

  return (
    <div
      ref={shellRef}
      className={cn(
        "group relative flex w-full flex-col gap-2 overflow-hidden rounded-xl border border-border bg-card",
        own.containerClassName
      )}
      tabIndex={0}
      data-player="video"
    >
      <video
        ref={videoRef}
        playsInline
        controls={!showControls}
        className={cn("aspect-video w-full bg-black object-contain", elementProps.className)}
        {...elementProps}
      >
        {own.captionSrc ? (
          <track kind="captions" src={own.captionSrc} srcLang="en" label="English" default />
        ) : null}
      </video>
      {showControls ? (
        <PlayerControlBar
          media={media}
          captionsOn={media.state.captionsOn}
          onRate={(r: import("./shortcuts").PlaybackRate) => {
            media.setPlaybackRate(r)
            own.onPlaybackRateChange?.(r)
          }}
          onToggleCaptions={toggleCaptions}
          onPip={togglePip}
          onFullscreen={toggleFullscreen}
        />
      ) : null}
    </div>
  )
})

function PlayerControlBar({
  media,
  captionsOn,
  onRate,
  onToggleCaptions,
  onPip,
  onFullscreen,
}: {
  media: ReturnType<typeof useMediaElement>
  captionsOn: boolean
  onRate: (r: import("./shortcuts").PlaybackRate) => void
  onToggleCaptions: () => void
  onPip: () => void
  onFullscreen: () => void
}) {
  const pipSupported =
    typeof document !== "undefined" && Boolean(document.pictureInPictureEnabled)
  const fsEnabled = typeof document !== "undefined" && document.fullscreenEnabled

  return (
    <div className="px-2 pb-2">
      <MediaControls
        playing={media.state.playing}
        currentTime={media.state.currentTime}
        duration={media.state.duration}
        volume={media.state.volume}
        muted={media.state.muted}
        playbackRate={media.state.playbackRate}
        captionsOn={captionsOn}
        pipSupported={pipSupported}
        fullscreenEnabled={fsEnabled}
        onTogglePlay={media.togglePlay}
        onSeek={media.scrubTo}
        onVolume={media.setVolume}
        onToggleMute={media.toggleMute}
        onRate={onRate}
        onToggleCaptions={onToggleCaptions}
        onPip={onPip}
        onFullscreen={onFullscreen}
      />
    </div>
  )
}