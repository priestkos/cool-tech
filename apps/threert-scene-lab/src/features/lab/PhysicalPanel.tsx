import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { readoutsFromBuiltScene, type UnitReadout } from "@/features/scene/physical"
import type { BuiltThreertScene } from "@/features/scene/build"
import type { SceneDocument } from "@/features/scene/document"

type Props = {
  doc: SceneDocument
  built: BuiltThreertScene
}

export function PhysicalPanel({ doc, built }: Props) {
  const readouts = readoutsFromBuiltScene(doc, built)

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Physical units (@threert/scene)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs leading-relaxed text-muted-foreground">
          <p>
            Readouts use the upstream{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[10px]">lightDesc()</code>{" "}
            helper and documented lux / cd / nits fields on lights and materials. The
            browser pane mirrors the graph with real three.js for raster preview only.
          </p>
          {readouts.map((r) => (
            <UnitReadoutRow key={r.label + r.physicalValue} r={r} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function UnitReadoutRow({ r }: { r: UnitReadout }) {
  return (
    <section className="rounded-lg border border-border bg-muted/30 p-2.5">
      <p className="font-medium text-foreground">{r.label}</p>
      <p className="mt-1 text-[11px]">{r.physicalValue}</p>
      <p className="mt-1 font-mono text-[10px] text-foreground/90">{r.threertValue}</p>
      <p className="mt-1 text-[10px] italic">{r.note}</p>
    </section>
  )
}