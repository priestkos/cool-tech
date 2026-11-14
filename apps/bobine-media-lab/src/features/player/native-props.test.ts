import { describe, expect, test } from "bun:test"
import { splitVideoProps, PLAYER_OWN_PROPS } from "./native-props"

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
})