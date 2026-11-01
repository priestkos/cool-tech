export interface Folder {
  id: string
  name: string
}

export interface Note {
  id: string
  folderId: string
  title: string
  body: string
  pinned: boolean
}

export interface JotterState {
  folders: Folder[]
  notes: Note[]
  selectedFolderId: string
  selectedNoteId: string | null
  searchQuery: string
}

export const INITIAL_JOTTER_STATE: JotterState = {
  folders: [
    { id: "f-personal", name: "Personal" },
    { id: "f-work", name: "Work" },
    { id: "f-ideas", name: "Ideas" },
  ],
  notes: [
    {
      id: "n-1",
      folderId: "f-personal",
      title: "Weekend plans",
      body: "Visit the library and finish the puzzle.",
      pinned: false,
    },
    {
      id: "n-2",
      folderId: "f-work",
      title: "Standup notes",
      body: "Ship the tree lab demo and write tests.",
      pinned: true,
    },
    {
      id: "n-3",
      folderId: "f-ideas",
      title: "Lab sketch",
      body: "Compare accessibility tree tokens with screenshot tokens.",
      pinned: false,
    },
  ],
  selectedFolderId: "f-personal",
  selectedNoteId: "n-1",
  searchQuery: "",
}

export function visibleNotes(state: JotterState): Note[] {
  const q = state.searchQuery.trim().toLowerCase()
  return state.notes
    .filter((n) => n.folderId === state.selectedFolderId)
    .filter((n) => {
      if (!q) return true
      return (
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q)
      )
    })
}

export function selectedNote(state: JotterState): Note | null {
  if (!state.selectedNoteId) return null
  return state.notes.find((n) => n.id === state.selectedNoteId) ?? null
}

export function createNote(state: JotterState): JotterState {
  const id = `n-${state.notes.length + 1}-${state.notes.length}`
  const note: Note = {
    id,
    folderId: state.selectedFolderId,
    title: "Untitled",
    body: "",
    pinned: false,
  }
  return {
    ...state,
    notes: [...state.notes, note],
    selectedNoteId: id,
  }
}

export function deleteSelectedNote(state: JotterState): JotterState {
  if (!state.selectedNoteId) return state
  const remaining = state.notes.filter((n) => n.id !== state.selectedNoteId)
  const visible = remaining.filter((n) => n.folderId === state.selectedFolderId)
  return {
    ...state,
    notes: remaining,
    selectedNoteId: visible[0]?.id ?? null,
  }
}
