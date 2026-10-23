"use client";
import { useEffect, useState } from "react";
import type { ComponentProps, CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { kindDefaults, staticFallbackCss } from "../lib/gradient-engine";
import type { GradientKind, GradientParams } from "../lib/gradient-engine";
import {
  GradientCanvas,
  resolveGradientParams,
  splitGradientProps,
} from "./gradient-surface";
import type { GradientProps } from "./gradient-surface";

/**
 * Crisp, fairly fast mesh: text is small, so shapes need to move to read as
 * motion. The base is a palette colour, not the kind's dark background, so
 * no part of a glyph can vanish into a dark page.
 */
export function gradientTextDefaults(
  kind: GradientKind = "mesh"
): GradientParams {
  const base = kindDefaults(kind);
  return {
    ...base,
    background: base.colors[1] ?? base.colors[0] ?? base.background,
    blur: 0.2,
    grain: 0,
    interaction: { pointer: 0, scroll: 0 },
    scale: 1.4,
    speed: 0.9,
  };
}

export interface GradientTextProps
  extends GradientProps, Omit<ComponentProps<"span">, keyof GradientProps> {
  /** Which gradient fills the text. Default "mesh". */
  kind?: GradientKind;
}

const supportsTextMask = () =>
  CSS.supports("-webkit-mask-clip", "text") ||
  CSS.supports("mask-clip", "text");

/**
 * Real, selectable text filled with a live gradient. The visible glyphs are
 * an aria-hidden copy of the text whose layer is masked to its own glyph
 * shapes (`mask-clip: text`), with the gradient canvas inside. The layer
 * overhangs the text box (with matching padding, so the copy lays out the
 * same) because the mask stops at the layer's edge and descenders, accents
 * and italic overhangs would otherwise be cut off. The real
 * text sits on top with a transparent fill, so selection, find-in-page,
 * copy and screen readers all use ordinary DOM text. Browsers without text
 * masks, and the server render, get the static gradient through
 * `background-clip: text`.
 */
export function GradientText({
  kind = "mesh",
  className,
  children,
  style,
  ...props
}: GradientTextProps) {
  const [gradient, rest] = splitGradientProps(props);
  const params = resolveGradientParams(gradientTextDefaults(kind), gradient);
  // The server can't know, so it renders the static fallback; upgrade after mount.
  const [masked, setMasked] = useState(false);
  useEffect(() => setMasked(supportsTextMask()), []);

  const textStyle: CSSProperties = masked
    ? { color: "transparent" }
    : {
        background: staticFallbackCss({ ...params, grain: 0 }),
        backgroundClip: "text",
        color: "transparent",
        WebkitBackgroundClip: "text",
      };

  return (
    <span
      className={cn("relative inline-block", className)}
      data-gradient-text=""
      style={style}
      {...rest}
    >
      {masked ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-x-[0.15em] -inset-y-[0.3em] px-[0.15em] py-[0.3em] select-none"
          style={{
            maskClip: "text",
            maskImage: "linear-gradient(#000 0 0)",
            WebkitMaskClip: "text",
            WebkitMaskImage: "linear-gradient(#000 0 0)",
          }}
        >
          <GradientCanvas
            params={params}
            maxDpr={gradient.maxDpr}
            reducedMotion={gradient.reducedMotion}
            className="absolute inset-0 block size-full"
          />
          {children}
        </span>
      ) : null}
      <span
        className="relative selection:bg-[color-mix(in_oklab,Highlight_40%,transparent)] selection:text-transparent"
        style={textStyle}
      >
        {children}
      </span>
    </span>
  );
}
