import { useEffect, useRef } from "react";
import type { CatalogEffect } from "@/lib/catalog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  clearFrame,
  composite,
  createFrame,
  createFx,
  type FxOptions,
} from "pixelfx";

function EffectThumb({
  fx,
  selected,
  onSelect,
}: {
  fx: CatalogEffect;
  selected: boolean;
  onSelect: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const meta = fx.mod.meta;
    const [w, h] = meta.size;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const frame = createFrame(w, h);
    const img = ctx.createImageData(w, h);
    const inst = createFx(fx.mod, {
      x: meta.origin[0],
      y: meta.origin[1],
      seed: (meta.options?.seed as number) ?? 1,
    } satisfies FxOptions);
    inst.update(0);
    clearFrame(frame);
    inst.draw(frame, "back");
    inst.draw(frame, "front");
    composite(frame, img.data, null);
    ctx.putImageData(img, 0, 0);
  }, [fx]);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "text-left transition-colors",
        selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "",
      )}
    >
      <Card className="overflow-hidden py-0 gap-0">
        <CardContent className="px-0 py-0">
          <div className="flex items-center justify-center bg-[linear-gradient(45deg,#80808033_25%,transparent_25%),linear-gradient(-45deg,#80808033_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#80808033_75%),linear-gradient(-45deg,transparent_75%,#80808033_75%)] bg-size-[12px_12px] bg-position-[0_0,0_6px,6px_-6px,-6px_0px] p-2">
            <canvas
              ref={canvasRef}
              className="max-h-20 max-w-full"
              style={{ imageRendering: "pixelated" }}
              aria-hidden
            />
          </div>
          <div className="space-y-1 p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium leading-tight">{fx.name}</p>
              {fx.hasAct ? <Badge variant="secondary">arena</Badge> : null}
            </div>
            <p className="line-clamp-2 text-xs text-muted-foreground">{fx.desc}</p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

export function EffectBrowser({
  grouped,
  selectedId,
  onSelect,
}: {
  grouped: Array<{ id: string; name: string; items: CatalogEffect[] }>;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {grouped.map((section) => (
        <section key={section.id} className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold">{section.name}</h2>
            <p className="text-xs text-muted-foreground">{section.items.length} effects</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {section.items.map((fx) => (
              <EffectThumb
                key={fx.id}
                fx={fx}
                selected={fx.id === selectedId}
                onSelect={() => onSelect(fx.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
