import { CutListPanel, cutListTotal } from "@/features/board/CutListPanel"
import { BoardCanvas } from "@/features/board/BoardCanvas"
import { Toolbar, triggerObjDownload } from "@/features/board/Toolbar"
import { useBoardLab } from "@/features/board/useBoardLab"

export default function App() {
  const lab = useBoardLab()
  const totalBf = cutListTotal(lab.state.boards)

  return (
    <div className="mx-auto flex min-h-svh max-w-[1600px] flex-col gap-4 p-3 md:p-4 lg:h-svh lg:max-h-svh lg:flex-row lg:overflow-hidden">
      <header className="sr-only lg:not-sr-only lg:absolute lg:left-4 lg:top-4 lg:z-10 lg:block lg:w-auto">
        <h1 className="text-lg font-semibold tracking-tight">BenchUp Board Lab</h1>
        <p className="text-xs text-muted-foreground">
          Independent three.js recreation · offline
        </p>
      </header>
      <aside className="flex w-full flex-col gap-3 lg:max-h-full lg:max-w-sm lg:shrink-0 lg:overflow-y-auto lg:pt-14">
        <Toolbar
          state={lab.state}
          onDraft={(field, value) =>
            lab.setState((s) => ({ ...s, [field]: value }))
          }
          onThicknessLive={lab.patchThicknessLive}
          onApplyThickness={lab.applyThickness}
          onExportJson={lab.exportJson}
          onImportJson={lab.importJson}
          onExportObj={() => triggerObjDownload(lab.state.boards)}
          onClear={lab.clearBoards}
        />
        <CutListPanel
          boards={lab.state.boards}
          selectedId={lab.state.selectedId}
          tool={lab.state.tool}
          totalBf={totalBf}
          onSelect={(id) => lab.selectBoard(id)}
          onTool={lab.setTool}
        />
      </aside>
      <main className="min-h-[360px] flex-1 lg:min-h-0 lg:pt-10">
        <BoardCanvas
          boards={lab.state.boards}
          selectedId={lab.state.selectedId}
          tool={lab.state.tool}
          previewLength={lab.parsedDims.length}
          previewWidth={lab.parsedDims.width}
          onPlace={lab.placeAt}
          onMove={lab.moveSelectedTo}
          onSelect={lab.selectBoard}
        />
      </main>
    </div>
  )
}
