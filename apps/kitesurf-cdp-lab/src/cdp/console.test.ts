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
})