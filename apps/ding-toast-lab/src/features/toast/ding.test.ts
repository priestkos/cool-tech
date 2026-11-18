import { describe, expect, test } from "bun:test"
import { createToaster } from "@yusufceng1z/ding"
import { archiveItem, INITIAL_ITEMS, restoreItem } from "./archive"

describe("@yusufceng1z/ding createToaster", () => {
  test("show success records a toast in state", () => {
    const ding = createToaster()
    ding.success("Saved")
    expect(ding.getState().toasts).toHaveLength(1)
    expect(ding.getState().toasts[0]?.title).toBe("Saved")
    expect(ding.getState().toasts[0]?.type).toBe("success")
  })

  test("morphs in place — loading then success stays one toast", () => {
    const ding = createToaster()
    ding.loading("Working")
    const firstId = ding.getState().toasts[0]?.id
    ding.success("Done")
    expect(ding.getState().toasts).toHaveLength(1)
    expect(ding.getState().toasts[0]?.id).toBe(firstId)
    expect(ding.getState().toasts[0]?.type).toBe("success")
    expect(ding.getState().toasts[0]?.title).toBe("Done")
  })

  test("update patches progress and title on the active toast", () => {
    const ding = createToaster()
    const id = ding.loading("Uploading")
    ding.update(id, { progress: 0.42, description: "42% complete" })
    const item = ding.getState().toasts[0]
    expect(item?.progress).toBeCloseTo(0.42)
    expect(item?.description).toBe("42% complete")
  })

  test("dismiss starts closing the active sticky error toast", () => {
    const ding = createToaster()
    ding.error("Oops")
    const id = ding.getState().toasts[0]?.id
    expect(id).toBeDefined()
    ding.dismiss(id, { immediate: true })
    const item = ding.getState().toasts.find((t) => t.id === id)
    expect(item === undefined || item.phase === "closing" || item.phase === "exit").toBe(true)
  })

  test("promise helper resolves to the fulfilled value", async () => {
    const ding = createToaster()
    const value = await ding.promise(
      () => Promise.resolve("payload"),
      { loading: "Wait", success: "OK", error: "Fail" },
    )
    expect(value).toBe("payload")
    expect(ding.getState().toasts[0]?.type).toBe("success")
    expect(ding.getState().toasts[0]?.title).toBe("OK")
  })
})

describe("archive sample list", () => {
  test("archive and restore sample item", () => {
    const archived = archiveItem(INITIAL_ITEMS, "b")
    expect(archived.find((i) => i.id === "b")?.archived).toBe(true)
    const restored = restoreItem(archived, "b")
    expect(restored.find((i) => i.id === "b")?.archived).toBe(false)
  })
})