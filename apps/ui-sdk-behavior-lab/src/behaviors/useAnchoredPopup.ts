import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react"
import { dismissSignalFromKey } from "./dismiss"
import { computePopupStyle, reducePopupOpen, type PopupPlacement } from "./popup"

type UseAnchoredPopupOptions = {
  placement?: PopupPlacement
  onOpenChange?: (open: boolean) => void
}

export function useAnchoredPopup(
  options: UseAnchoredPopupOptions = {},
): {
  open: boolean
  setOpen: (next: boolean) => void
  toggle: () => void
  triggerRef: RefObject<HTMLButtonElement | null>
  popupRef: RefObject<HTMLDivElement | null>
  listboxId: string
  popupStyle: CSSProperties
} {
  const { placement = "bottom-start", onOpenChange } = options
  const [open, setOpenState] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({})

  const setOpen = useCallback(
    (next: boolean) => {
      setOpenState(next)
      onOpenChange?.(next)
    },
    [onOpenChange],
  )

  const toggle = useCallback(() => {
    setOpen(reducePopupOpen(open, "toggle"))
  }, [open, setOpen])

  useEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPopupStyle(computePopupStyle(rect, placement))
  }, [open, placement])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (dismissSignalFromKey(e.key) === "escape") {
        e.preventDefault()
        setOpen(false)
      }
    }
    const onPointer = (e: MouseEvent) => {
      const trigger = triggerRef.current
      const popup = popupRef.current
      if (!trigger) return
      const target = e.target
      if (target == null || typeof target !== "object") return
      if (trigger.contains(target as Node)) return
      if (popup?.contains(target as Node)) return
      setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onPointer)
    }
  }, [open, setOpen])

  return {
    open,
    setOpen,
    toggle,
    triggerRef,
    popupRef,
    listboxId,
    popupStyle,
  }
}
