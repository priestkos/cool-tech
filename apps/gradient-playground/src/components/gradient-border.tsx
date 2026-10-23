"use client";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { kindDefaults } from "../lib/gradient-engine";
import type { GradientKind, GradientParams } from "../lib/gradient-engine";
import {
  GradientCanvas,
  resolveGradientParams,
  splitGradientProps,
} from "./gradient-surface";
import type { GradientProps } from "./gradient-surface";

/** A quick, crisp linear flow: a thin ring needs visible travel to read as motion. */
export function gradientBorderDefaults(
  kind: GradientKind = "linear-flow"
): GradientParams {
  const base = kindDefaults(kind);
  const colors: GradientParams["colors"] = [
    "#7c5cff",
    "#38d6f5",
    "#ff5ca8",
    "#ffb36b",
  ];
  return {
    ...base,
    // A palette colour as the base, so no stretch of a thin ring goes dark.
    background: colors[0] ?? base.background,
    blur: 0.3,
    colors,
    grain: 0,
    interaction: { pointer: 0, scroll: 0 },
    scale: 1.2,
    speed: 1.2,
  };
}

export interface GradientBorderProps
  extends GradientProps, Omit<ComponentProps<"div">, keyof GradientProps> {
  /** Which gradient runs around the border. Default "linear-flow". */
  kind?: GradientKind;
  /** Border thickness in pixels. Default 1.5. */
  borderWidth?: number;
  /** Corner radius in pixels. Default 16. */
  radius?: number;
}

/**
 * An animated gradient border around its children. The gradient is masked to
 * a ring (`mask-composite: exclude`), so the inside stays transparent and
 * shows whatever is behind the component.
 */
export function GradientBorder({
  kind = "linear-flow",
  borderWidth = 1.5,
  radius = 16,
  className,
  children,
  style,
  ...props
}: GradientBorderProps) {
  const [gradient, rest] = splitGradientProps(props);
  const params = resolveGradientParams(gradientBorderDefaults(kind), gradient);
  const ring =
    "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)";

  return (
    <div
      className={cn("relative isolate", className)}
      style={{ borderRadius: radius, padding: borderWidth, ...style }}
      {...rest}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          borderRadius: radius,
          mask: ring,
          maskComposite: "exclude",
          padding: borderWidth,
          WebkitMask: ring,
          WebkitMaskComposite: "xor",
        }}
      >
        <GradientCanvas
          params={params}
          maxDpr={gradient.maxDpr ?? 1}
          reducedMotion={gradient.reducedMotion}
          className="absolute inset-0 block size-full"
        />
      </span>
      {children}
    </div>
  );
}
