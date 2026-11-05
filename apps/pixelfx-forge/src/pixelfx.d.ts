declare module "pixelfx" {
  export function createFrame(w: number, h: number, ox?: number, oy?: number): Frame;
  export function clearFrame(f: Frame): Frame;
  export function createFx(mod: EffectModule, o?: FxOptions): FxInstance;
  export function createAct(mod: EffectModule, o?: FxOptions): ActInstance;
  export function composite(
    f: Frame,
    out: Uint8ClampedArray,
    bg?: null | number | Uint32Array,
    lightK?: number,
  ): Uint8ClampedArray;
  export function backdrop(kind: string, w: number, h: number, groundY?: number): Uint32Array;
  export function hex(h: string | number): number;
  export function fit(r: string[], n: number): number[];
  export function toHex(c: number): string;
  export function drawActor(
    painter: unknown,
    actor: unknown,
    alpha: number,
  ): void;
  export function painterFor(frame: Frame): {
    place(x: number, y: number, flip: boolean): unknown;
    reset(): unknown;
  };
  export function stockActor(variant?: number): unknown;
  export function actorAlphaOf(mod: EffectModule, t: number, opts: FxOptions): number;
  export function actBounds(mod: EffectModule): {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  export const PAL: Record<string, string[]>;

  export interface Frame {
    w: number;
    h: number;
    ox: number;
    oy: number;
    color: Uint32Array;
    light: Uint32Array;
  }

  export interface EffectMeta {
    name: string;
    desc?: string;
    tags?: string[];
    size: [number, number];
    origin: [number, number];
    duration: number;
    loop: boolean;
    fps: number;
    bg?: string;
    actor?: number | boolean;
    options?: Record<string, unknown> & { palette?: string[]; seed?: number };
  }

  export interface EffectModule {
    meta: EffectMeta;
    act?: unknown;
    create?: (opts: FxOptions) => unknown;
  }

  export interface FxOptions {
    x?: number;
    y?: number;
    flip?: boolean;
    angle?: number;
    seed?: number;
    palette?: string[];
    light?: number;
    actor?: unknown;
    [key: string]: unknown;
  }

  export interface FxInstance {
    meta: EffectMeta;
    options: FxOptions;
    t: number;
    update(dt: number): void;
    draw(frame: Frame, layer?: "back" | "front"): void;
    stop(): void;
    done(): boolean;
  }

  export interface ActInstance extends FxInstance {
    fx: FxInstance;
    shake: [number, number];
    draw(frame: Frame, opts?: { body?: boolean; target?: boolean }): void;
  }
}

declare module "pixelfx/fx/index" {
  import type { EffectModule } from "pixelfx";

  export const categories: Array<{ id: string; name: string; blurb: string }>;
  export const effects: Record<string, EffectModule>;
}
