import { describe, expect, test } from "bun:test"
import { collectConsoleLines, mapConsoleEvent } from "./console"
import { PAGE_LOAD_TRANSCRIPTS } from "../fixtures/transcripts"

describe("console mapping", () => {
  test("maps Runtime.consoleAPICalled", () => {
    const event = {
      method: "Runtime.consoleAPICalled",
      params: {
        type: "log",
        args: [{ type: "string", value: "hello" }],
      },
    }
    const line = mapConsoleEvent(event, 10)
    expect(line?.text).toBe("hello")
    expect(line?.type).toBe("log")
  })

  test("collects console lines from load transcript", () => {
    const lines = collectConsoleLines(PAGE_LOAD_TRANSCRIPTS["kite-intro"])
    expect(lines).toHaveLength(2)
    expect(lines[0].text).toContain("fixture mode")
  })

  test("ignores other events and keeps numeric argument values", () => {
    expect(mapConsoleEvent({ method: "Page.loadEventFired" }, 1)).toBeNull()
    expect(mapConsoleEvent({ method: "Runtime.consoleAPICalled" }, 2)).toEqual({
      atMs: 2,
      type: "log",
      text: "",
      argsPreview: [],
    })
    expect(
      mapConsoleEvent(
        {
          method: "Runtime.consoleAPICalled",
          params: {
            type: "error",
            args: [{ value: 0, description: "zero" }, { description: "obj" }, { type: "object" }, {}],
          },
        },
        3,
      )?.argsPreview,
    ).toEqual(["0", "obj", "object", "?"])
    expect(
      collectConsoleLines([
        {
          atMs: 1,
          direction: "request",
          payload: { id: 1, method: "Runtime.consoleAPICalled" },
        },
      ]),
    ).toEqual([])
  })
})