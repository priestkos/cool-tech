import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AUTOSAVE_KEY,
  applyPushPull,
  createBoard,
  type Board,
  type ToolMode,
  parseDimension,
  serializeLab,
  parseLabJson,
  snapPlacement,
} from "./model"

export type BoardLabState = {
  boards: Board[]
  selectedId: string | null
  tool: ToolMode
  draftLength: string
  draftWidth: string
  thicknessDraft: string
  message: string | null
}

const initial: BoardLabState = {
  boards: [],
  selectedId: null,
  tool: "place",
  draftLength: "24",
  draftWidth: "12",
  thicknessDraft: "0.75",
  message: null,
}

function loadAutosave(): Board[] {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY)
    if (!raw) return []
    return parseLabJson(raw)
  } catch {
    return []
  }
}

export function useBoardLab() {
  const [state, setState] = useState<BoardLabState>(() => ({
    ...initial,
    boards: loadAutosave(),
  }))

  useEffect(() => {
    try {
      localStorage.setItem(AUTOSAVE_KEY, serializeLab(state.boards))
    } catch {
      /* ignore quota */
    }
  }, [state.boards])

  const selected = useMemo(
    () => state.boards.find((b) => b.id === state.selectedId) ?? null,
    [state.boards, state.selectedId]
  )

  const parsedDims = useMemo(() => {
    return {
      length: parseDimension(state.draftLength),
      width: parseDimension(state.draftWidth),
    }
  }, [state.draftLength, state.draftWidth])

  const setTool = useCallback((tool: ToolMode) => {
    setState((s) => ({ ...s, tool, message: null }))
  }, [])

  const selectBoard = useCallback((id: string | null) => {
    setState((s) => {
      const board = s.boards.find((b) => b.id === id)
      return {
        ...s,
        selectedId: id,
        thicknessDraft: board ? String(board.thickness) : s.thicknessDraft,
      }
    })
  }, [])

  const placeAt = useCallback(
    (x: number, z: number) => {
      const { length, width } = parsedDims
      if (!length || !width) {
        setState((s) => ({
          ...s,
          message: "Enter valid length and width (inches or feet).",
        }))
        return
      }
      const snapped = snapPlacement(state.boards, null, length, width, x, z)
      const board = createBoard(length, width, snapped.x, snapped.z)
      setState((s) => ({
        ...s,
        boards: [...s.boards, board],
        selectedId: board.id,
        tool: "pushpull",
        message: "Board placed — adjust Push/Pull thickness.",
      }))
    },
    [parsedDims, state.boards]
  )

  const moveSelectedTo = useCallback(
    (x: number, z: number) => {
      if (!state.selectedId) return
      const board = state.boards.find((b) => b.id === state.selectedId)
      if (!board) return
      const snapped = snapPlacement(
        state.boards,
        board.id,
        board.length,
        board.width,
        x,
        z
      )
      setState((s) => ({
        ...s,
        boards: s.boards.map((b) =>
          b.id === board.id ? { ...b, originX: snapped.x, originZ: snapped.z } : b
        ),
        message: "Board moved with edge snap.",
      }))
    },
    [state.boards, state.selectedId]
  )

  const applyThickness = useCallback(() => {
    if (!state.selectedId) return
    const value = parseDimension(state.thicknessDraft)
    if (!value) {
      setState((s) => ({ ...s, message: "Enter a valid thickness in inches." }))
      return
    }
    const clamped = applyPushPull(
      state.boards.find((b) => b.id === state.selectedId)!,
      value
    ).thickness
    setState((s) => ({
      ...s,
      boards: s.boards.map((b) =>
        b.id === s.selectedId ? applyPushPull(b, value) : b
      ),
      message: `Thickness set to ${clamped} in`,
    }))
  }, [state.selectedId, state.thicknessDraft, state.boards])

  const patchThicknessLive = useCallback((raw: string) => {
    setState((s) => {
      const value = parseDimension(raw)
      if (!value || !s.selectedId) {
        return { ...s, thicknessDraft: raw }
      }
      return {
        ...s,
        thicknessDraft: raw,
        boards: s.boards.map((b) =>
          b.id === s.selectedId ? applyPushPull(b, value) : b
        ),
      }
    })
  }, [])

  const exportJson = useCallback(() => serializeLab(state.boards), [state.boards])

  const importJson = useCallback((raw: string) => {
    try {
      const boards = parseLabJson(raw)
      setState((s) => ({
        ...s,
        boards,
        selectedId: boards[0]?.id ?? null,
        message: "Loaded lab JSON.",
      }))
    } catch {
      setState((s) => ({ ...s, message: "Invalid JSON file." }))
    }
  }, [])

  const clearBoards = useCallback(() => {
    setState((s) => ({
      ...s,
      boards: [],
      selectedId: null,
      message: "Cleared all boards.",
    }))
  }, [])

  const preview =
    parsedDims.length && parsedDims.width && state.tool === "place"
      ? {
          length: parsedDims.length,
          width: parsedDims.width,
          originX: 0,
          originZ: 0,
        }
      : null

  return {
    state,
    setState,
    selected,
    parsedDims,
    preview,
    setTool,
    selectBoard,
    placeAt,
    moveSelectedTo,
    applyThickness,
    patchThicknessLive,
    exportJson,
    importJson,
    clearBoards,
  }
}
