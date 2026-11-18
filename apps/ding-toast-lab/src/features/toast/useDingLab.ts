import { setSprings, toast } from "@yusufceng1z/ding"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  INITIAL_ITEMS,
  archiveItem,
  restoreItem,
  type SampleItem,
} from "./archive"
import { PROGRESS_TICK_MS, promiseMessages, promiseTask, type PromiseOutcome } from "./fixtures"

const SNAPPY_SPRING = { stiffness: 1200, damping: 120, mass: 1 }

export function useDingLab(motionEnabled: boolean) {
  const [items, setItems] = useState<SampleItem[]>(INITIAL_ITEMS)
  const lastArchivedId = useRef<string | null>(null)
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (motionEnabled) {
      setSprings({})
    } else {
      setSprings({
        enter: SNAPPY_SPRING,
        morph: SNAPPY_SPRING,
        stack: SNAPPY_SPRING,
      })
    }
  }, [motionEnabled])

  useEffect(
    () => () => {
      if (progressTimer.current) clearInterval(progressTimer.current)
    },
    [],
  )

  const dismiss = useCallback(() => {
    toast.dismiss()
  }, [])

  const showSuccess = useCallback(() => {
    toast.success("Saved", { description: "Your changes are stored locally." })
  }, [])

  const showError = useCallback(() => {
    toast.error("Something went wrong", {
      description: "Fixture error — no network request was made.",
    })
  }, [])

  const runPromise = useCallback((outcome: PromiseOutcome) => {
    void toast.promise(promiseTask(outcome), promiseMessages(outcome))
  }, [])

  const runProgress = useCallback(() => {
    if (progressTimer.current) clearInterval(progressTimer.current)
    const id = toast.loading("Uploading assets", {
      description: "Local progress simulation",
      progress: 0,
    })
    let value = 0
    progressTimer.current = setInterval(() => {
      value = Math.min(1, value + 0.18)
      if (value >= 1) {
        if (progressTimer.current) clearInterval(progressTimer.current)
        progressTimer.current = null
        toast.update(id, {
          type: "success",
          title: "Upload complete",
          description: "Progress reached 100%.",
          progress: null,
        })
      } else {
        toast.update(id, {
          progress: value,
          description: `${Math.round(value * 100)}% complete`,
        })
      }
    }, PROGRESS_TICK_MS)
  }, [])

  const archiveWithUndo = useCallback(() => {
    const target = items.find((item) => !item.archived) ?? items[0]
    if (!target) return
    lastArchivedId.current = target.id
    setItems((list) => archiveItem(list, target.id))
    toast.success("Archived", {
      description: `${target.label} moved to archive.`,
      action: {
        label: "Undo",
        onClick: () => {
          const id = lastArchivedId.current
          if (id) {
            setItems((list) => restoreItem(list, id))
            lastArchivedId.current = null
          }
          return {
            title: "Restored",
            description: "Archive action reversed.",
            type: "success",
            action: null,
          }
        },
      },
    })
  }, [items])

  const interruptRapid = useCallback(() => {
    toast.success("Saved")
    window.setTimeout(() => toast.error("Transient error"), 80)
    window.setTimeout(() => toast.loading("Catching up…"), 160)
    window.setTimeout(
      () =>
        toast.success("Settled", {
          description: "Interrupted updates coalesced into one toast.",
        }),
      520,
    )
  }, [])

  return {
    items,
    dismiss,
    showSuccess,
    showError,
    runPromise,
    runProgress,
    archiveWithUndo,
    interruptRapid,
  }
}