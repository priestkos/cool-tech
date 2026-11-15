import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  emissiveReadout,
  pointLmReadout,
  spotCdReadout,
  sunLuxReadout,
} from "@/features/scene/physical"
import type { SceneLabFile } from "@/features/scene/schema"

type Props = {
  scene: SceneLabFile
}

export function PhysicalPanel({ scene }: Props) {
  const readouts = [
    sunLuxReadout(scene.environment.sun.illuminanceLux),
    ...scene.lights.map((l) =>
      l.type === "point"
        ? pointLmReadout(l.luminousFluxLm)
        : spotCdReadout(l.intensityCd)
    ),
    ...scene.meshes
      .filter((m) => m.material.emissive?.exitanceLmPerM2)
      .map((m) =>
        emissiveReadout(m.material.emissive?.exitanceLmPerM2 ?? 0)
      ),
  ]

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Physical units → three.js</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs leading-relaxed text-muted-foreground">
          <p>
            This lab maps{" "}
            <strong className="text-foreground">lux / lm / cd / emissive exitance</strong>{" "}
            into three.js lights with physically meaningful intensities. The preview
            uses shadow maps — unlike ThreeRT&apos;s native path tracer, which traces
            sun disks and emissive geometry without baked shadows.
          </p>
          {readouts.map((r) => (
            <UnitReadoutRow key={r.label + r.physicalValue} r={r} />
          ))}
          {readouts.length === 1 && (
            <p className="text-[11px]">Add point/spot lights or emissive meshes for more readouts.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function UnitReadoutRow({
  r,
}: {
  r: ReturnType<typeof sunLuxReadout>
}) {
  return (
    <section className="rounded-lg border border-border bg-muted/30 p-2.5">
      <p className="font-medium text-foreground">{r.label}</p>
      <p className="mt-1 text-[11px]">{r.physicalValue}</p>
      <p className="mt-1 font-mono text-[10px] text-foreground/90">{r.threeJsValue}</p>
      <p className="mt-1 text-[10px] italic">{r.note}</p>
    </section>
  )
}