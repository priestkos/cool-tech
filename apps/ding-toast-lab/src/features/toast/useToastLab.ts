import { useCallback, useEffect, useRef, useState } from "react"
import {
  DISMISS_AFTER_MS,
  PROGRESS_TICK_MS,
  PROMISE_REJECT_MS,
  PROMISE_RESOLVE_MS,
  progressAfterTick,
  promiseLabel,
  type PromiseOutcome,
} from "./fixtures"
import {
  HIDDEN_TOAST,
  INITIAL_ITEMS,
  archiveItem,
  dismissToast,
  morphToast,
  markErrorAnnounced,
  restoreItem,
  shouldApplyAsyncResult,
  type SampleItem,
  type ToastSnapshot,
} from "./model"

type TimerBag = {
  dismiss?: ReturnType<typeof setTimeout>
  promise?: ReturnType<typeof setTimeout>
  progress?: ReturnType<typeof setInterval>
}

export function useToastLab() {
  const [toast, setToast] = useState<ToastSnapshot>(HIDDEN_TOAST)
  const [items, setItems] = useState<SampleItem[]>(INITIAL_ITEMS)
  const [dismissPaused, setDismissPaused] = useState(false)
  const toastRef = useRef(toast)
  const timers = useRef<TimerBag>({})
  const lastArchivedId = useRef<string | null>(null)

  useEffect(() => {
    toastRef.current = toast
  }, [toast])

  const clearTimers = useCallback(() => {
    const bag = timers.current
    if (bag.dismiss) clearTimeout(bag.dismiss)
    if (bag.promise) clearTimeout(bag.promise)
    if (bag.progress) clearInterval(bag.progress)
    timers.current = {}
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  const scheduleDismiss = useCallback(() => {
    if (timers.current.dismiss) clearTimeout(timers.current.dismiss)
    if (dismissPaused) return
    timers.current.dismiss = setTimeout(() => {
      setToast((current) => dismissToast(current))
    }, DISMISS_AFTER_MS)
  }, [dismissPaused])

  useEffect(() => {
    if (toast.status === "hidden" || toast.status === "loading") return
    if (toast.actionKind === "undo") return
    scheduleDismiss()
  }, [toast.actionKind, toast.generation, toast.status, scheduleDismiss])

  const showMorph = useCallback((input: Parameters<typeof morphToast>[1], increment = false) => {
    clearTimers()
    setToast((prev) => morphToast(prev, input, { incrementGeneration: increment }))
  }, [clearTimers])

  const dismiss = useCallback(() => {
    clearTimers()
    setToast((prev) => dismissToast(prev))
  }, [clearTimers])

  const showSuccess = useCallback(() => {
    showMorph({ status: "success", title: "Saved", description: "Your changes are stored locally." })
  }, [showMorph])

  const showError = useCallback(() => {
    showMorph({
      status: "error",
      title: "Something went wrong",
      description: "Fixture error — no network request was made.",
    })
  }, [showMorph])

  const runPromise = useCallback(
    (outcome: PromiseOutcome) => {
      clearTimers()
      const gen = toastRef.current.generation + 1
      setToast(
        morphToast(
          toastRef.current,
          {
            status: "loading",
            title: promiseLabel(outcome),
            description: "Simulated async task",
          },
          { incrementGeneration: true },
        ),
      )
      const delay = outcome === "resolve" ? PROMISE_RESOLVE_MS : PROMISE_REJECT_MS
      timers.current.promise = setTimeout(() => {
        setToast((live) => {
          if (!shouldApplyAsyncResult(gen, live.generation, live.status)) return live
          if (outcome === "resolve") {
            return morphToast(live, {
              status: "success",
              title: "Draft saved",
              description: "Promise resolved (fixture).",
            })
          }
          return morphToast(live, {
            status: "error",
            title: "Delete failed",
            description: "Promise rejected (fixture).",
          })
        })
      }, delay)
    },
    [clearTimers],
  )

  const runProgress = useCallback(() => {
    clearTimers()
    const gen = toastRef.current.generation + 1
    setToast(
      morphToast(
        toastRef.current,
        {
          status: "progress",
          title: "Uploading assets",
          description: "Local progress simulation",
          progress: 0,
        },
        { incrementGeneration: true },
      ),
    )
    let value = 0
    timers.current.progress = setInterval(() => {
      value = progressAfterTick(value)
      setToast((live) => {
        if (live.generation !== gen || live.status !== "progress") return live
        if (value >= 100) {
          clearTimers()
          return morphToast(live, {
            status: "success",
            title: "Upload complete",
            description: "Progress reached 100%.",
            progress: null,
          })
        }
        return morphToast(live, {
          status: "progress",
          title: "Uploading assets",
          description: `${value}% complete`,
          progress: value,
        })
      })
    }, PROGRESS_TICK_MS)
  }, [clearTimers])

  const archiveWithUndo = useCallback(() => {
    const target = items.find((item) => !item.archived) ?? items[0]
    if (!target) return
    lastArchivedId.current = target.id
    setItems((list) => archiveItem(list, target.id))
    showMorph({
      status: "success",
      title: "Archived",
      description: `${target.label} moved to archive.`,
      actionLabel: "Undo",
      actionKind: "undo",
    })
  }, [items, showMorph])

  const runUndo = useCallback(() => {
    const id = lastArchivedId.current
    if (!id) return
    setItems((list) => restoreItem(list, id))
    showMorph({
      status: "success",
      title: "Restored",
      description: "Archive action reversed.",
      actionLabel: null,
      actionKind: "none",
    })
    lastArchivedId.current = null
  }, [showMorph])

  const interruptRapid = useCallback(() => {
    showSuccess()
    window.setTimeout(() => showError(), 80)
    window.setTimeout(() => showMorph({ status: "loading", title: "Catching up…" }), 160)
    window.setTimeout(
      () =>
        showMorph({
          status: "success",
          title: "Settled",
          description: "Interrupted updates coalesced into one toast.",
        }),
      520,
    )
  }, [showError, showMorph, showSuccess])

  const onToastAction = useCallback(() => {
    if (toast.actionKind === "undo") runUndo()
    else dismiss()
  }, [dismiss, runUndo, toast.actionKind])

  const markErrorLive = useCallback(() => {
    setToast((t) => markErrorAnnounced(t))
  }, [])

  return {
    toast,
    items,
    dismissPaused,
    setDismissPaused,
    showSuccess,
    showError,
    runPromise,
    runProgress,
    archiveWithUndo,
    dismiss,
    interruptRapid,
    onToastAction,
    markErrorLive,
  }
}
