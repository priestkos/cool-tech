import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  actorAlphaOf,
  clearFrame,
  composite,
  createAct,
  createFrame,
  createFx,
  drawActor,
  painterFor,
  stockActor,
  type ActInstance,
  type EffectModule,
  type FxInstance,
  type FxOptions,
} from "pixelfx";
import { backdropForMode } from "@/lib/render-export";
import { computeStageLayout } from "@/lib/stage-layout";
import type { BackgroundMode } from "@/lib/url-state";

type PlayerInst = FxInstance | ActInstance;

function isAct(inst: PlayerInst): inst is ActInstance {
  return "shake" in inst;
}

export function StageViewport({
  mod,
  options,
  playing,
  loop,
  speed,
  scale,
  scrubTime,
  isScrubbing,
  bg,
  useArena,
  showBody,
  showTarget,
  onTimeChange,
  restartToken,
  canvasRef,
}: {
  mod: EffectModule;
  options: FxOptions;
  playing: boolean;
  loop: boolean;
  speed: number;
  scale: number;
  scrubTime: number;
  isScrubbing: boolean;
  bg: BackgroundMode;
  useArena: boolean;
  showBody: boolean;
  showTarget: boolean;
  onTimeChange: (t: number) => void;
  restartToken: number;
  canvasRef?: MutableRefObject<HTMLCanvasElement | null>;
}) {
  const localRef = useRef<HTMLCanvasElement>(null);
  const ref = canvasRef ?? localRef;
  const playerRef = useRef<{
    inst: PlayerInst;
    acc: number;
    wait: number;
    frame: ReturnType<typeof createFrame>;
    img: ImageData;
  } | null>(null);

  const layout = useMemo(
    () => computeStageLayout(mod, useArena && showBody),
    [mod, useArena, showBody],
  );

  const buildPlayer = useCallback(() => {
    const { x, y, acted } = layout;
    const inst = (acted ? createAct : createFx)(mod, { ...options, x, y });
    const frame = createFrame(layout.W, layout.H);
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    const img = ctx?.createImageData(layout.W, layout.H);
    if (!img) return null;
    return { inst, acc: 0, wait: 0, frame, img };
  }, [layout, mod, options, ref]);

  const render = useCallback(() => {
    const canvas = ref.current;
    const player = playerRef.current;
    if (!canvas || !player) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { inst, frame, img } = player;
    clearFrame(frame);
    const bgBuf = backdropForMode(bg, layout.W, layout.H, layout.y);
    if (isAct(inst)) {
      inst.draw(frame, { body: showBody, target: showTarget });
      composite(frame, img.data, bgBuf);
      const [sx, sy] = inst.shake;
      if (sx || sy) ctx.clearRect(0, 0, layout.W, layout.H);
      ctx.putImageData(img, sx, sy);
      return;
    }
    inst.draw(frame, "back");
    const meta = mod.meta;
    const tt = meta.loop ? inst.t % meta.duration : Math.min(inst.t, meta.duration);
    if (meta.actor && showBody) {
      drawActor(
        painterFor(frame).place(layout.x, layout.y, !!options.flip),
        inst.options.actor ?? stockActor(),
        actorAlphaOf(mod, tt, inst.options),
      );
    }
    inst.draw(frame, "front");
    composite(frame, img.data, bgBuf);
    ctx.putImageData(img, 0, 0);
  }, [bg, layout, mod, options.flip, ref, showBody, showTarget]);

  const seek = useCallback(
    (t: number) => {
      const player = buildPlayer();
      if (!player) return;
      player.inst.update(t);
      playerRef.current = player;
      onTimeChange(t);
      render();
    },
    [buildPlayer, onTimeChange, render],
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = layout.W;
    canvas.height = layout.H;
    playerRef.current = buildPlayer();
    render();
  }, [buildPlayer, layout.H, layout.W, render, restartToken]);

  useEffect(() => {
    if (isScrubbing) seek(scrubTime);
  }, [isScrubbing, scrubTime, seek]);

  useEffect(() => {
    if (isScrubbing) return;
    playerRef.current = buildPlayer();
    render();
  }, [buildPlayer, isScrubbing, options, render]);

  useEffect(() => {
    if (isScrubbing || !playing) return;
    let raf = 0;
    let last = performance.now();
    const meta = mod.meta;
    const step = 1 / (meta.fps ?? 30);

    const tick = (now: number) => {
      const player = playerRef.current;
      if (!player) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      player.acc = Math.min(player.acc + dt * speed, 0.25);
      let moved = false;
      while (player.acc >= step) {
        player.acc -= step;
        const inst = player.inst;
        const ended = isAct(inst)
          ? inst.done()
          : !meta.loop && inst.t >= meta.duration;
        if (ended) {
          player.wait += step;
          if (loop || player.wait > 0.45) {
            playerRef.current = buildPlayer();
            player.wait = 0;
          }
        } else {
          inst.update(step);
          onTimeChange(inst.t);
        }
        moved = true;
      }
      if (moved) render();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [
    buildPlayer,
    isScrubbing,
    loop,
    mod.meta,
    onTimeChange,
    playing,
    render,
    speed,
  ]);

  return (
    <div
      className="inline-block overflow-hidden rounded-md border bg-[linear-gradient(45deg,#80808033_25%,transparent_25%),linear-gradient(-45deg,#80808033_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#80808033_75%),linear-gradient(-45deg,transparent_75%,#80808033_75%)] bg-size-[16px_16px] bg-position-[0_0,0_8px,8px_-8px,-8px_0px]"
      style={{ width: layout.W * scale, height: layout.H * scale }}
    >
      <canvas
        ref={ref}
        className="block h-full w-full"
        style={{ imageRendering: "pixelated", width: "100%", height: "100%" }}
        aria-label="Effect stage. Click to replay arena hit."
      />
    </div>
  );
}

export function useStageRestart() {
  const [restartToken, setRestartToken] = useState(0);
  const bumpRestart = useCallback(() => setRestartToken((t) => t + 1), []);
  return { restartToken, bumpRestart };
}
