import type React from "react"

export type PopupAction = "open" | "close" | "toggle"

export function reducePopupOpen(isOpen: boolean, action: PopupAction): boolean {
  switch (action) {
    case "open":
      return true
    case "close":
      return false
    case "toggle":
      return !isOpen
    default: {
      const _exhaustive: never = action
      return _exhaustive
    }
  }
}

export type PopupPlacement = "bottom-start" | "bottom-end"

export function computePopupStyle(
  triggerRect: DOMRectReadOnly,
  placement: PopupPlacement,
): React.CSSProperties {
  const top = triggerRect.bottom + 4
  const left =
    placement === "bottom-end"
      ? triggerRect.right
      : triggerRect.left
  const transform =
    placement === "bottom-end" ? "translateX(-100%)" : undefined
  return {
    position: "fixed",
    top,
    left,
    transform,
    minWidth: triggerRect.width,
    zIndex: 50,
  }
}
