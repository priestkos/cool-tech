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

/** The kind's own tuning, with a little more pointer and scroll response. */
export function heroBackgroundDefaults(
  kind: GradientKind = "mesh"
): GradientParams {
  const base = kindDefaults(kind);
  return {
    ...base,
    interaction: {
      pointer: Math.max(base.interaction.pointer, 0.3),
      scroll: Math.max(base.interaction.scroll, 0.25),
    },
  };
}

export interface HeroBackgroundProps
  extends GradientProps, Omit<ComponentProps<"section">, keyof GradientProps> {
  /** Which gradient fills the hero. Default "mesh". */
  kind?: GradientKind;
  /** Fade the bottom edge into the page background (`var(--background)`). Default true. */
  fade?: boolean;
}

/**
 * A full-bleed hero section on a live gradient. Children are centred on top.
 * It reacts to the pointer and to scroll velocity, and the bottom edge fades
 * into the page so the next section starts cleanly.
 */
export function HeroBackground({
  kind = "mesh",
  fade = true,
  className,
  children,
  ...props
}: HeroBackgroundProps) {
  const [gradient, rest] = splitGradientProps(props);
  const params = resolveGradientParams(heroBackgroundDefaults(kind), gradient);
  return (
    <section
      className={cn(
        "relative isolate flex min-h-[560px] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center",
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
      {fade ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-linear-to-b from-transparent to-[var(--background,#000)]"
        />
      ) : null}
      {children}
    </section>
  );
}
