"use client";
import { kindDefaults } from "../lib/gradient-engine";
import type { GradientParams } from "../lib/gradient-engine";
import { GradientBackground } from "./gradient-surface";
import type { GradientBackgroundProps } from "./gradient-surface";

/** Layered bands of colour rolling past each other. */
export const wavesDefaults: GradientParams = kindDefaults("waves");

export type WavesProps = GradientBackgroundProps;

export function Waves(props: WavesProps) {
  return <GradientBackground defaults={wavesDefaults} {...props} />;
}
