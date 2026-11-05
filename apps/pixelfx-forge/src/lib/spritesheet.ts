export interface SheetLayout {
  cols: number;
  rows: number;
  width: number;
  height: number;
  frameCount: number;
}

export function computeSheetLayout(
  frameCount: number,
  frameW: number,
  frameH: number,
): SheetLayout {
  const cols = Math.min(
    frameCount,
    Math.max(1, Math.ceil(Math.sqrt((frameCount * frameH) / frameW))),
  );
  const rows = Math.ceil(frameCount / cols);
  return {
    cols,
    rows,
    width: cols * frameW,
    height: rows * frameH,
    frameCount,
  };
}

export interface AsepriteFrame {
  frame: { x: number; y: number; w: number; h: number };
  duration: number;
}

export function buildAsepriteJson(
  name: string,
  frameW: number,
  frameH: number,
  fps: number,
  layout: SheetLayout,
): { frames: Record<string, AsepriteFrame>; meta: Record<string, unknown> } {
  const frames: Record<string, AsepriteFrame> = {};
  const durationMs = Math.round(1000 / fps);
  for (let i = 0; i < layout.frameCount; i++) {
    const col = i % layout.cols;
    const row = Math.floor(i / layout.cols);
    frames[`${name}_${i}`] = {
      frame: { x: col * frameW, y: row * frameH, w: frameW, h: frameH },
      duration: durationMs,
    };
  }
  return {
    frames,
    meta: {
      app: "PixelFX Forge",
      version: "1.0",
      image: `${name}.png`,
      format: "RGBA8888",
      size: { w: layout.width, h: layout.height },
      scale: "1",
      frameTags: [],
    },
  };
}

export function exportFileBase(id: string): string {
  return `pixelfx-${id.replace(/\//g, "-")}`;
}
