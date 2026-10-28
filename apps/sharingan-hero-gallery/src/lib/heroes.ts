import type { ComponentType } from "react";
import type { z } from "zod";
import { AuroraMeshHero, auroraMeshFallbackStyle } from "@/components/heroes/aurora-mesh/aurora-mesh";
import { auroraMeshConfigSchema, auroraMeshContentSchema } from "@/components/heroes/aurora-mesh/schema";
import { auroraMeshExample } from "@/components/heroes/aurora-mesh/example";
import { meta as auroraMeta } from "@/components/heroes/aurora-mesh/meta";
import { InkFlowHero, inkFlowFallbackStyle } from "@/components/heroes/ink-flow/ink-flow";
import { inkFlowConfigSchema, inkFlowContentSchema } from "@/components/heroes/ink-flow/schema";
import { inkFlowExample } from "@/components/heroes/ink-flow/example";
import { meta as inkMeta } from "@/components/heroes/ink-flow/meta";
import { SplitHeadlineHero } from "@/components/heroes/split-headline/split-headline";
import {
  splitHeadlineConfigSchema,
  splitHeadlineContentSchema,
} from "@/components/heroes/split-headline/schema";
import { splitHeadlineExample } from "@/components/heroes/split-headline/example";
import { meta as splitMeta } from "@/components/heroes/split-headline/meta";
import { HoloCardHero } from "@/components/heroes/holo-card/holo-card";
import { holoCardConfigSchema, holoCardContentSchema } from "@/components/heroes/holo-card/schema";
import { holoCardExample } from "@/components/heroes/holo-card/example";
import { meta as holoMeta } from "@/components/heroes/holo-card/meta";
import { BeamGridHero } from "@/components/heroes/beam-grid/beam-grid";
import { beamGridConfigSchema, beamGridContentSchema } from "@/components/heroes/beam-grid/schema";
import { beamGridExample } from "@/components/heroes/beam-grid/example";
import { meta as beamMeta } from "@/components/heroes/beam-grid/meta";
import { getSchemaDefaults } from "@/lib/schema-controls";

export type HeroEngine = "webgpu" | "dom";

export type HeroDefinition = {
  id: string;
  title: string;
  engine: HeroEngine;
  summary: string;
  componentName: string;
  Component: ComponentType<{ content?: unknown; config?: unknown; className?: string }>;
  contentSchema: z.ZodObject<z.ZodRawShape>;
  configSchema: z.ZodObject<z.ZodRawShape>;
  defaultContent: Record<string, unknown>;
  defaultConfig: Record<string, unknown>;
  fallbackStyle?: (config: Record<string, unknown>) => Record<string, string>;
};

export const heroes: HeroDefinition[] = [
  {
    id: auroraMeta.name,
    title: auroraMeta.title,
    engine: auroraMeta.engine,
    summary: auroraMeta.summary,
    componentName: "AuroraMeshHero",
    Component: AuroraMeshHero as HeroDefinition["Component"],
    contentSchema: auroraMeshContentSchema,
    configSchema: auroraMeshConfigSchema,
    defaultContent: auroraMeshExample as Record<string, unknown>,
    defaultConfig: getSchemaDefaults(auroraMeshConfigSchema) as Record<string, unknown>,
    fallbackStyle: (config) => auroraMeshFallbackStyle(config),
  },
  {
    id: inkMeta.name,
    title: inkMeta.title,
    engine: inkMeta.engine,
    summary: inkMeta.summary,
    componentName: "InkFlowHero",
    Component: InkFlowHero as HeroDefinition["Component"],
    contentSchema: inkFlowContentSchema,
    configSchema: inkFlowConfigSchema,
    defaultContent: inkFlowExample as Record<string, unknown>,
    defaultConfig: getSchemaDefaults(inkFlowConfigSchema) as Record<string, unknown>,
    fallbackStyle: (config) => inkFlowFallbackStyle(config),
  },
  {
    id: splitMeta.name,
    title: splitMeta.title,
    engine: splitMeta.engine,
    summary: splitMeta.summary,
    componentName: "SplitHeadlineHero",
    Component: SplitHeadlineHero as HeroDefinition["Component"],
    contentSchema: splitHeadlineContentSchema,
    configSchema: splitHeadlineConfigSchema,
    defaultContent: splitHeadlineExample as Record<string, unknown>,
    defaultConfig: getSchemaDefaults(splitHeadlineConfigSchema) as Record<string, unknown>,
  },
  {
    id: holoMeta.name,
    title: holoMeta.title,
    engine: holoMeta.engine,
    summary: holoMeta.summary,
    componentName: "HoloCardHero",
    Component: HoloCardHero as HeroDefinition["Component"],
    contentSchema: holoCardContentSchema,
    configSchema: holoCardConfigSchema,
    defaultContent: holoCardExample as Record<string, unknown>,
    defaultConfig: getSchemaDefaults(holoCardConfigSchema) as Record<string, unknown>,
  },
  {
    id: beamMeta.name,
    title: beamMeta.title,
    engine: beamMeta.engine,
    summary: beamMeta.summary,
    componentName: "BeamGridHero",
    Component: BeamGridHero as HeroDefinition["Component"],
    contentSchema: beamGridContentSchema,
    configSchema: beamGridConfigSchema,
    defaultContent: beamGridExample as Record<string, unknown>,
    defaultConfig: getSchemaDefaults(beamGridConfigSchema) as Record<string, unknown>,
  },
];

export function getHero(id: string): HeroDefinition {
  const hero = heroes.find((h) => h.id === id);
  if (!hero) {
    throw new Error(`Unknown hero: ${id}`);
  }
  return hero;
}
