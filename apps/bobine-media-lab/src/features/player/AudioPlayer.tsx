import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  type AudioHTMLAttributes,
} from "react"
import { cn } from "@/lib/utils"
import { MediaControls } from "./MediaControls"
import { splitAudioProps, type VideoPlayerOwn } from "./native-props"
import { useKeyboardShortcuts } from "./useKeyboardShortcuts"
import { useMediaElement } from "./useMediaElement"

export type AudioPlayerProps = AudioHTMLAttributes<HTMLAudioElement> & VideoPlayerOwn

export const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(function AudioPlayer(
  props,
  ref
) {
  const { elementProps, own } = splitAudioProps(props)
  const audioRef = useRef<HTMLAudioElement>(null)
  const shellRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => audioRef.current as HTMLAudioElement)

  const showControls = own.showCustomControls !== false
  const media = useMediaElement(audioRef)

  const adjustVolume = useCallback(
    (delta: number) => {
      const el = audioRef.current
      if (!el) return
      media.setVolume(el.volume + delta)
    },
    [media]
  )

  const noopFullscreen = useCallback(() => {}, [])

  useKeyboardShortcuts(
    showControls,
    {
      togglePlay: media.togglePlay,
      seekBy: media.seekBy,
      adjustVolume,
      toggleMute: media.toggleMute,
      toggleFullscreen: noopFullscreen,
      toggleCaptions: () => {},
      toggleHelp: () => {},
    },
    shellRef
  )

  return (
    <div
      ref={shellRef}
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-3",
        own.containerClassName
      )}
      tabIndex={0}
      data-player="audio"
    >
      <audio
        ref={audioRef}
        controls={!showControls}
        className={cn("w-full", elementProps.className)}
        {...elementProps}
      />
      {showControls ? (
        <MediaControls
          playing={media.state.playing}
          currentTime={media.state.currentTime}
          duration={media.state.duration}
          volume={media.state.volume}
          muted={media.state.muted}
          playbackRate={media.state.playbackRate}
          captionsOn={false}
          pipSupported={false}
          fullscreenEnabled={false}
          onTogglePlay={media.togglePlay}
          onSeek={media.scrubTo}
          onVolume={media.setVolume}
          onToggleMute={media.toggleMute}
          onRate={media.setPlaybackRate}
          onToggleCaptions={() => {}}
          onPip={() => {}}
          onFullscreen={noopFullscreen}
          compact
        />
      ) : null}
    </div>
  )
})