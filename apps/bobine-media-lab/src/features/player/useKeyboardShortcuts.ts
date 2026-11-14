import { useEffect, type RefObject } from "react"
import { mapKeyToAction, type ShortcutAction } from "./shortcuts"

export type KeyboardHandlerContext = {
  togglePlay: () => void
  seekBy: (delta: number) => void
  adjustVolume: (delta: number) => void
  toggleMute: () => void
  toggleFullscreen: () => void
  toggleCaptions: () => void
  toggleHelp: () => void
}

export function dispatchShortcutAction(
  action: ShortcutAction,
  ctx: KeyboardHandlerContext
): void {
  switch (action) {
    case "togglePlay":
      ctx.togglePlay()
      break
    case "seekBack10":
      ctx.seekBy(-10)
      break
    case "seekForward10":
      ctx.seekBy(10)
      break
    case "seekBackSmall":
      ctx.seekBy(-5)
      break
    case "seekForwardSmall":
      ctx.seekBy(5)
      break
    case "volumeUp":
      ctx.adjustVolume(0.1)
      break
    case "volumeDown":
      ctx.adjustVolume(-0.1)
      break
    case "toggleMute":
      ctx.toggleMute()
      break
    case "toggleFullscreen":
      ctx.toggleFullscreen()
      break
    case "toggleCaptions":
      ctx.toggleCaptions()
      break
    case "showHelp":
      ctx.toggleHelp()
      break
    default: {
      const _exhaustive: never = action
      void _exhaustive
    }
  }
}

export function shouldDispatchShortcut(
  root: { contains: (node: Node) => boolean } | null | undefined,
  active: Node | null
): boolean {
  if (!root || !active) return true
  return active === root || root.contains(active)
}

export function useKeyboardShortcuts(
  enabled: boolean,
  ctx: KeyboardHandlerContext,
  targetRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement
      const typingInField =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement ||
        (active instanceof HTMLElement && active.isContentEditable)

      const action = mapKeyToAction(event.key, event.code, { typingInField })
      if (!action) return

      if (action !== "showHelp" && typingInField) return

      if (!shouldDispatchShortcut(targetRef?.current, active)) return

      event.preventDefault()
      dispatchShortcutAction(action, ctx)
    }

    const node = targetRef?.current ?? document
    node.addEventListener("keydown", onKeyDown as EventListener)
    return () => node.removeEventListener("keydown", onKeyDown as EventListener)
  }, [enabled, ctx, targetRef])
}