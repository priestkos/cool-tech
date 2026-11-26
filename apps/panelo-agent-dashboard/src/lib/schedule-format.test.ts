import { describe, expect, test } from "bun:test"
import { clock, clockFull, hourLabel, initials } from "./schedule-format"

describe("schedule format", () => {
  test("clock", () => {
    expect(clock(0)).toBe("12:00")
    expect(clock(7 * 60 + 30)).toBe("7:30")
    expect(clock(12 * 60)).toBe("12:00")
    expect(clock(13 * 60 + 5)).toBe("1:05")
  })

  test("clockFull", () => {
    expect(clockFull(0)).toBe("12:00 AM")
    expect(clockFull(11 * 60 + 59)).toBe("11:59 AM")
    expect(clockFull(12 * 60)).toBe("12:00 PM")
    expect(clockFull(13 * 60 + 38)).toBe("1:38 PM")
  })

  test("hourLabel", () => {
    expect(hourLabel(0)).toBe("12 AM")
    expect(hourLabel(7)).toBe("7 AM")
    expect(hourLabel(12)).toBe("12 PM")
    expect(hourLabel(19)).toBe("7 PM")
  })

  test("initials", () => {
    expect(initials("Marisol Quintanar")).toBe("MQ")
    expect(initials("Nizam")).toBe("N")
    expect(initials("A B C")).toBe("AB")
  })
})
