import { describe, expect, test } from "bun:test"
import { splitAudioProps, splitVideoProps, PLAYER_OWN_PROPS } from "./native-props"

describe("splitVideoProps", () => {
  test("keeps native props on the element bag", () => {
    const { elementProps, own } = splitVideoProps({
      src: "/clip.mp4",
      autoPlay: true,
      captionSrc: "/c.vtt",
      showCustomControls: true,
      className: "w-full",
    })

    expect(elementProps.src).toBe("/clip.mp4")
    expect(elementProps.autoPlay).toBe(true)
    expect(elementProps.className).toBe("w-full")
    expect(own.captionSrc).toBe("/c.vtt")
    expect(own.showCustomControls).toBe(true)
  })

  test("player own prop list is stable", () => {
    expect(PLAYER_OWN_PROPS).toContain("captionSrc")
    expect(PLAYER_OWN_PROPS).not.toContain("src")
  })

  test("strips every player prop, including a false controls flag", () => {
    const onCaptionsChange = () => {}
    const onPlaybackRateChange = () => {}
    const onToggleHelp = () => {}
    const { elementProps, own } = splitVideoProps({
      src: "/clip.mp4",
      controls: true,
      showCustomControls: false,
      captionSrc: "/c.vtt",
      onCaptionsChange,
      onPlaybackRateChange,
      onToggleHelp,
      containerClassName: "shell",
    })

    expect(elementProps).toEqual({ src: "/clip.mp4", controls: true })
    expect(own.showCustomControls).toBe(false)
    expect(own.captionSrc).toBe("/c.vtt")
    expect(own.containerClassName).toBe("shell")
    expect(own.onCaptionsChange).toBe(onCaptionsChange)
    expect(own.onPlaybackRateChange).toBe(onPlaybackRateChange)
    expect(own.onToggleHelp).toBe(onToggleHelp)
  })
})

describe("splitAudioProps", () => {
  test("keeps native audio props and removes player props", () => {
    const { elementProps, own } = splitAudioProps({
      src: "/tone.mp3",
      loop: true,
      preload: "metadata",
      captionSrc: "/c.vtt",
      showCustomControls: false,
    })

    expect(elementProps).toEqual({
      src: "/tone.mp3",
      loop: true,
      preload: "metadata",
    })
    expect(own).toEqual({
      captionSrc: "/c.vtt",
      showCustomControls: false,
    })
  })
})