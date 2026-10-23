"use client";
import type { ComponentProps, CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { kindDefaults } from "../lib/gradient-engine";
import type { GradientKind, GradientParams } from "../lib/gradient-engine";
import {
  GradientCanvas,
  resolveGradientParams,
  splitGradientProps,
} from "./gradient-surface";
import type { GradientProps } from "./gradient-surface";

/**
 * A saturated mesh with no grain. Every stop, and the base, is dark enough
 * that the white label keeps at least 4.5:1 contrast on any frame, including
 * the hover brightening. Keep custom palettes at the same depth.
 */
export function gradientButtonDefaults(
  kind: GradientKind = "mesh"
): GradientParams {
  return {
    ...kindDefaults(kind),
    background: "#3b1fd1",
    blur: 0.4,
    colors: ["#5b3df0", "#9b2fd9", "#c2255c", "#2f5fd9"],
    grain: 0,
    interaction: { pointer: 0, scroll: 0 },
    scale: 1.3,
    speed: 0.9,
  };
}

const sizes = {
  lg: "h-12 gap-2.5 px-6 text-base",
  md: "h-10 gap-2 px-5 text-sm",
  sm: "h-8 gap-1.5 px-3.5 text-[13px]",
} as const;

export interface GradientButtonProps
  extends GradientProps, Omit<ComponentProps<"button">, keyof GradientProps> {
  /** Which gradient fills the button. Default "mesh". */
  kind?: GradientKind;
  /** Height and padding. Default "md". */
  size?: keyof typeof sizes;
}

/**
 * A button filled with a live gradient. Hover brightens it, keyboard focus
 * draws an offset ring, and disabled dims and desaturates it. The label is white, so keep
 * the palette dark (see gradientButtonDefaults).
 */
export function GradientButton({
  kind = "mesh",
  size = "md",
  type = "button",
  className,
  children,
  style,
  ...props
}: GradientButtonProps) {
  const [gradient, rest] = splitGradientProps(props);
  const params = resolveGradientParams(gradientButtonDefaults(kind), gradient);
  const glow: CSSProperties & { "--gradient-button-glow": string } = {
    "--gradient-button-glow": `color-mix(in oklab, ${params.colors[1] ?? params.colors[0]} 55%, transparent)`,
    ...style,
  };

  return (
    <button
      type={type}
      className={cn(
        "group/gradient-button relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full font-medium whitespace-nowrap text-white outline-none select-none",
        "shadow-[0_1px_2px_rgb(0_0_0/0.25),0_6px_20px_-8px_var(--gradient-button-glow)] hover:shadow-[0_1px_2px_rgb(0_0_0/0.25),0_10px_28px_-6px_var(--gradient-button-glow)] hover:brightness-110",
        // Reduced motion: only a short colour change.
        "motion-safe:transition-[box-shadow,filter,opacity] motion-safe:duration-150 motion-safe:ease-out",
        "motion-reduce:transition-[filter,opacity] motion-reduce:duration-100 motion-reduce:ease-linear",
        "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring,var(--foreground,#7c5cff))]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:saturate-[0.35] disabled:hover:brightness-100",
        sizes[size],
        className
      )}
      style={glow}
      {...rest}
    >
      <GradientCanvas
        params={params}
        maxDpr={gradient.maxDpr}
        reducedMotion={gradient.reducedMotion}
        className="pointer-events-none absolute inset-0 -z-10 block size-full"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-linear-to-b from-transparent to-black/15 ring-1 ring-white/20 ring-inset"
      />
      {children}
    </button>
  );
}
