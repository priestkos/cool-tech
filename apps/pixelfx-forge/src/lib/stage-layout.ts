import { actBounds, type EffectModule } from "pixelfx";

export function computeStageLayout(
  mod: EffectModule,
  useAct: boolean,
  aspect = 16 / 9,
  pad = 1.15,
) {
  const meta = mod.meta;
  const acted = useAct && Boolean(mod.act);
  let bounds = acted ? { ...actBounds(mod) } : null;
  if (bounds) bounds.y1 = Math.min(bounds.y1, 22);
  const [w, h] = acted
    ? [bounds!.x1 - bounds!.x0, bounds!.y1 - bounds!.y0]
    : meta.size;
  const [ox, oy] = acted ? [-bounds!.x0, -bounds!.y0] : meta.origin;
  const W = Math.ceil(
    Math.max(
      w * (acted ? Math.min(pad, 1.1) : pad),
      h * (acted ? Math.min(pad, 1.1) : pad) * aspect,
    ),
  );
  const H = Math.ceil(W / aspect);
  const x = Math.floor((W - w) / 2) + ox;
  const y = acted
    ? Math.max(oy + 2, H - bounds!.y1 - 2)
    : Math.floor((H - h) / 2) + oy;
  return { W, H, x, y, acted };
}
