import type { VideoHTMLAttributes, AudioHTMLAttributes } from "react"

export const PLAYER_OWN_PROPS = [
  "captionSrc",
  "showCustomControls",
  "onCaptionsChange",
  "onPlaybackRateChange",
  "onToggleHelp",
  "containerClassName",
] as const

export type PlayerOwnProp = (typeof PLAYER_OWN_PROPS)[number]

export type VideoPlayerOwn = {
  captionSrc?: string
  showCustomControls?: boolean
  onCaptionsChange?: (enabled: boolean) => void
  onPlaybackRateChange?: (rate: number) => void
  onToggleHelp?: () => void
  containerClassName?: string
}

export function splitVideoProps(
  props: VideoHTMLAttributes<HTMLVideoElement> & VideoPlayerOwn
): {
  elementProps: VideoHTMLAttributes<HTMLVideoElement>
  own: VideoPlayerOwn
} {
  const own: VideoPlayerOwn = {}
  const elementProps = { ...props }

  for (const key of PLAYER_OWN_PROPS) {
    if (key in elementProps) {
      ;(own as Record<string, unknown>)[key] = elementProps[key as keyof typeof elementProps]
      delete elementProps[key as keyof typeof elementProps]
    }
  }

  return { elementProps, own }
}

export function splitAudioProps(
  props: AudioHTMLAttributes<HTMLAudioElement> & VideoPlayerOwn
): {
  elementProps: AudioHTMLAttributes<HTMLAudioElement>
  own: VideoPlayerOwn
} {
  const own: VideoPlayerOwn = {}
  const elementProps = { ...props }

  for (const key of PLAYER_OWN_PROPS) {
    if (key in elementProps) {
      ;(own as Record<string, unknown>)[key] = elementProps[key as keyof typeof elementProps]
      delete elementProps[key as keyof typeof elementProps]
    }
  }

  return { elementProps, own }
}