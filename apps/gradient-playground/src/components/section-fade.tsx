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

/** Aurora with extra softness, so the faded edges dissolve rather than cut. */
export function sectionFadeDefaults(
  kind: GradientKind = "aurora"
): GradientParams {
  const base = kindDefaults(kind);
  return { ...base, blur: Math.max(base.blur, 0.5) };
}

const masks = {
  both: "linear-gradient(to bottom, transparent, #000 28%, #000 72%, transparent)",
  bottom: "linear-gradient(to bottom, #000 55%, transparent)",
  top: "linear-gradient(to bottom, transparent, #000 45%)",
} as const;

export interface SectionFadeProps
  extends GradientProps, Omit<ComponentProps<"section">, keyof GradientProps> {
  /** Which gradient fills the section. Default "aurora". */
  kind?: GradientKind;
  /** Which edges fade to transparent. Default "both". */
  edges?: keyof typeof masks;
}

/**
 * A section whose gradient fades out at its edges, so it blends into
 * whatever sits above and below it instead of ending on a hard line.
 */
export function SectionFade({
  kind = "aurora",
  edges = "both",
  className,
  children,
  ...props
}: SectionFadeProps) {
  const [gradient, rest] = splitGradientProps(props);
  const params = resolveGradientParams(sectionFadeDefaults(kind), gradient);
  return (
    <section
      className={cn("relative isolate overflow-hidden", className)}
      {...rest}
    >
      <GradientCanvas
        params={params}
        maxDpr={gradient.maxDpr}
        reducedMotion={gradient.reducedMotion}
        className="pointer-events-none absolute inset-0 -z-10 block size-full"
        style={{ maskImage: masks[edges], WebkitMaskImage: masks[edges] }}
      />
      {children}
    </section>
  );
}
