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

/** Grain, slowed down: a card sits next to text and should not compete with it. */
export function gradientCardDefaults(
  kind: GradientKind = "grain"
): GradientParams {
  const base = kindDefaults(kind);
  return {
    ...base,
    interaction: { pointer: 0.15, scroll: 0 },
    speed: base.speed * 0.8,
  };
}

export interface GradientCardProps
  extends GradientProps, Omit<ComponentProps<"div">, keyof GradientProps> {
  /** Which gradient fills the card. Default "grain". */
  kind?: GradientKind;
  /** Darken the bottom of the card so text there stays legible. Default true. */
  scrim?: boolean;
}

/**
 * A card on a live gradient, with a hairline inner edge and an optional
 * bottom scrim for legible white text. Content goes inside as children.
 */
export function GradientCard({
  kind = "grain",
  scrim = true,
  className,
  children,
  ...props
}: GradientCardProps) {
  const [gradient, rest] = splitGradientProps(props);
  const params = resolveGradientParams(gradientCardDefaults(kind), gradient);
  return (
    <div
      className={cn(
        "relative isolate flex flex-col justify-end overflow-hidden rounded-2xl p-6 text-white",
        className
      )}
      {...rest}
    >
      <GradientCanvas
        params={params}
        maxDpr={gradient.maxDpr}
        reducedMotion={gradient.reducedMotion}
        className="pointer-events-none absolute inset-0 -z-10 block size-full"
      />
      {scrim ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-black/55 via-black/10 to-transparent"
        />
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-white/12 ring-inset"
      />
      {children}
    </div>
  );
}
