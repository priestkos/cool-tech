import type { JotterState } from "@/lib/jotter-model"
import { visibleNotes } from "@/lib/jotter-model"
import type { AgentCursor } from "@/hooks/useLabState"
import { cn } from "@/lib/utils"

interface Props {
  state: JotterState
  highlightKey: string | null
  onHighlight: (key: string | null) => void
  cursors: AgentCursor[]
  windowRef?: React.RefObject<HTMLDivElement | null>
}

export function JotterWindow({
  state,
  highlightKey,
  onHighlight,
  cursors,
  windowRef,
}: Props) {
  const notes = visibleNotes(state)
  const selected =
    state.notes.find((n) => n.id === state.selectedNoteId) ?? null

  const hl = (key: string) =>
    cn(
      "rounded-sm transition-shadow duration-200",
      highlightKey === key && "ring-2 ring-amber-400 ring-offset-1 shadow-md",
    )

  return (
    <div
      ref={windowRef}
      className="mx-auto w-full max-w-[520px] overflow-hidden rounded-lg border border-zinc-300 bg-zinc-100 shadow-xl"
      data-testid="jotter-window"
    >
      <div className="flex items-center gap-2 border-b border-zinc-300 bg-zinc-200 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="flex-1 text-center text-xs font-medium text-zinc-700">
          Jotter
        </span>
      </div>
      <div className="relative flex h-[340px] bg-white">
        {cursors.map((c) => (
          <CursorBadge key={c.agentId} cursor={c} />
        ))}
        <aside className="w-28 border-r border-zinc-200 bg-zinc-50 p-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Folders
          </p>
          <ul className="space-y-1">
            {state.folders.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  data-a11y-key={`folder-${f.id}`}
                  className={hl(`folder-${f.id}`) + " w-full px-2 py-1 text-left text-xs"}
                  onMouseEnter={() => onHighlight(`folder-${f.id}`)}
                  onMouseLeave={() => onHighlight(null)}
                  onClick={() => onHighlight(`folder-${f.id}`)}
                >
                  {f.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col p-2">
          <input
            data-a11y-key="field-search"
            className={hl("field-search") + " mb-2 w-full rounded border border-zinc-300 px-2 py-1 text-xs"}
            placeholder="Search notes"
            value={state.searchQuery}
            readOnly
            onMouseEnter={() => onHighlight("field-search")}
            onMouseLeave={() => onHighlight(null)}
          />
          <ul className="mb-2 max-h-20 space-y-0.5 overflow-y-auto border-b border-zinc-100 pb-2">
            {notes.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  data-a11y-key={`note-${n.id}`}
                  className={
                    hl(`note-${n.id}`) +
                    " w-full truncate px-1 py-0.5 text-left text-xs " +
                    (n.id === state.selectedNoteId ? "bg-sky-100 font-medium" : "")
                  }
                  onMouseEnter={() => onHighlight(`note-${n.id}`)}
                  onMouseLeave={() => onHighlight(null)}
                >
                  {n.title || "Untitled"}
                  {n.pinned ? " · pinned" : ""}
                </button>
              </li>
            ))}
          </ul>
          <div className="mb-2 flex gap-1">
            {(
              [
                ["btn-new", "New"],
                ["btn-delete", "Delete"],
                ["btn-share", "Share"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                data-a11y-key={key}
                className={hl(key) + " rounded border border-zinc-300 bg-zinc-50 px-2 py-0.5 text-[11px]"}
                onMouseEnter={() => onHighlight(key)}
                onMouseLeave={() => onHighlight(null)}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            data-a11y-key="field-title"
            className={hl("field-title") + " mb-1 w-full rounded border border-zinc-300 px-2 py-1 text-sm font-semibold"}
            value={selected?.title ?? ""}
            readOnly
            placeholder="Note title"
            onMouseEnter={() => onHighlight("field-title")}
            onMouseLeave={() => onHighlight(null)}
          />
          <textarea
            data-a11y-key="field-body"
            className={hl("field-body") + " mb-2 min-h-[80px] w-full flex-1 resize-none rounded border border-zinc-300 px-2 py-1 text-xs"}
            value={selected?.body ?? ""}
            readOnly
            onMouseEnter={() => onHighlight("field-body")}
            onMouseLeave={() => onHighlight(null)}
          />
          <label
            className={hl("checkbox-pin") + " flex items-center gap-2 text-xs"}
            data-a11y-key="checkbox-pin"
            onMouseEnter={() => onHighlight("checkbox-pin")}
            onMouseLeave={() => onHighlight(null)}
          >
            <input type="checkbox" readOnly checked={selected?.pinned ?? false} />
            Pin note
          </label>
        </div>
      </div>
    </div>
  )
}

function CursorBadge({ cursor }: { cursor: AgentCursor }) {
  return (
    <div
      className="pointer-events-none absolute z-20 flex items-center gap-1 text-[10px] font-semibold text-white transition-all duration-300"
      style={{
        left: "40%",
        top: cursor.agentId === "writer" ? "55%" : "72%",
        color: cursor.color,
      }}
    >
      <span
        className="inline-block size-3 rotate-45 border-2 border-current bg-white"
        style={{ borderColor: cursor.color }}
      />
      <span
        className="rounded px-1 py-0.5 shadow"
        style={{ backgroundColor: cursor.color }}
      >
        {cursor.agentId}
      </span>
    </div>
  )
}
