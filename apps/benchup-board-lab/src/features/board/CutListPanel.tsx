import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  boardFeet,
  totalBoardFeet,
  type Board,
  type ToolMode,
} from "./model"

type Props = {
  boards: Board[]
  selectedId: string | null
  tool: ToolMode
  totalBf: number
  onSelect: (id: string) => void
  onTool: (tool: ToolMode) => void
}

export function CutListPanel({
  boards,
  selectedId,
  tool,
  totalBf,
  onSelect,
  onTool,
}: Props) {
  return (
    <Card className="flex h-full flex-col gap-0 border-border/80 shadow-sm">
      <CardHeader className="gap-2 pb-3">
        <CardTitle className="text-sm font-semibold tracking-tight">
          Cut list
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Thickness × width × length (in). Board-feet = T×W×L ÷ 144.
        </p>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Tools">
          {(["place", "pushpull", "move"] as ToolMode[]).map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={tool === mode ? "default" : "outline"}
              onClick={() => onTool(mode)}
              role="tab"
              aria-selected={tool === mode}
            >
              {mode === "place" ? "Draw" : mode === "pushpull" ? "Push/Pull" : "Move"}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-3 pt-0">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Total board-feet</span>
          <Badge variant="secondary" className="font-mono text-xs">
            {totalBf.toFixed(3)} BF
          </Badge>
        </div>
        <Separator />
        <ul
          className="flex max-h-[min(50vh,320px)] flex-col gap-2 overflow-y-auto pr-1 text-xs"
          aria-label="Board cut list"
        >
          {boards.length === 0 ? (
            <li className="text-muted-foreground">No boards yet — draw on the grid.</li>
          ) : (
            boards.map((board, index) => {
              const bf = boardFeet(board.thickness, board.width, board.length)
              const active = board.id === selectedId
              return (
                <li key={board.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(board.id)}
                    className={`w-full rounded-md border px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/60"
                    }`}
                  >
                    <span className="font-medium">Board {index + 1}</span>
                    <div className="mt-1 grid grid-cols-2 gap-x-2 font-mono text-[11px] text-muted-foreground">
                      <span>T {board.thickness}&quot;</span>
                      <span>W {board.width}&quot;</span>
                      <span>L {board.length}&quot;</span>
                      <span>{bf.toFixed(3)} BF</span>
                    </div>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </CardContent>
    </Card>
  )
}

export function cutListTotal(boards: Board[]): number {
  return totalBoardFeet(boards)
}
