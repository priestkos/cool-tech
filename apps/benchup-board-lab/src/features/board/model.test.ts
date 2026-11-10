import { describe, expect, test } from "bun:test"
import { exportBoardsObj } from "./export"
import {
  applyPushPull,
  boardFeet,
  createBoard,
  parseDimension,
  parseLabJson,
  serializeLab,
  snapPlacement,
  totalBoardFeet,
} from "./model"

describe("parseDimension", () => {
  test("parses inches and feet", () => {
    expect(parseDimension("24")).toBe(24)
    expect(parseDimension('24"')).toBe(24)
    expect(parseDimension("2 ft")).toBe(24)
    expect(parseDimension("1 1/2")).toBe(1.5)
  })

  test("rejects invalid", () => {
    expect(parseDimension("")).toBeNull()
    expect(parseDimension("0")).toBeNull()
    expect(parseDimension("abc")).toBeNull()
  })
})

describe("push/pull thickness", () => {
  test("clamps thickness", () => {
    const board = createBoard(24, 12, 0, 0, 0.75)
    expect(applyPushPull(board, 0.1).thickness).toBe(0.25)
    expect(applyPushPull(board, 10).thickness).toBe(4)
    expect(applyPushPull(board, 1.5).thickness).toBe(1.5)
  })
})

describe("edge snap", () => {
  test("snaps shelf edge to edge", () => {
    const a = createBoard(24, 12, 0, 0)
    const { x, z } = snapPlacement([a], null, 24, 12, 24.1, 0)
    expect(x).toBe(24)
    expect(z).toBe(0)
  })
})

describe("cut list and board feet", () => {
  test("board-feet math", () => {
    expect(boardFeet(0.75, 5.5, 96)).toBeCloseTo(2.75, 3)
    const boards = [
      createBoard(48, 12, 0, 0, 0.75),
      createBoard(48, 12, 48, 0, 0.75),
    ]
    expect(totalBoardFeet(boards)).toBeCloseTo(boardFeet(0.75, 12, 48) * 2, 3)
  })
})

describe("JSON round-trip", () => {
  test("serialize and parse", () => {
    const boards = [createBoard(36, 10, 2, 3, 1)]
    const json = serializeLab(boards)
    const again = parseLabJson(json)
    expect(again).toEqual(boards)
  })
})

describe("OBJ export", () => {
  test("contains vertices and faces", () => {
    const obj = exportBoardsObj([createBoard(24, 12, 0, 0, 0.75)])
    expect(obj).toContain("v ")
    expect(obj).toContain("f ")
  })
})
