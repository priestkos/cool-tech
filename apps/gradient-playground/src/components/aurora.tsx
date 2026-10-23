"use client";
import { kindDefaults } from "../lib/gradient-engine";
import type { GradientParams } from "../lib/gradient-engine";
import { GradientBackground } from "./gradient-surface";
import type { GradientBackgroundProps } from "./gradient-surface";

/** Vertical light curtains folding over a night sky. */
export const auroraDefaults: GradientParams = kindDefaults("aurora");

export type AuroraProps = GradientBackgroundProps;

export function Aurora(props: AuroraProps) {
  return <GradientBackground defaults={auroraDefaults} {...props} />;
}
