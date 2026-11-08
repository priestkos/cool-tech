import type { FixtureId, LabPreferences } from "./types.ts"

/** Illustrative mapping from fixtures to real component APIs — not AI-generated output. */
export interface SpecEntry {
  library: "astryx" | "shadcn"
  fixture: FixtureId
  integrationMode: "real-package"
  components: Array<{
    name: string
    props: Record<string, string>
  }>
  tokens: Array<{ name: string; role: string }>
  preferencesSnapshot: LabPreferences
  notes: string
}

const ASTRYX_VERSION = "0.7.8"
const SHADCN_CLI_VERSION = "4.22.1"

export function buildSpec(
  fixture: FixtureId,
  preferences: LabPreferences,
): { astryx: SpecEntry; shadcn: SpecEntry } {
  if (fixture === "settings") {
    return {
      astryx: {
        library: "astryx",
        fixture,
        integrationMode: "real-package",
        components: [
          { name: "Card", props: { variant: "default", padding: "md" } },
          {
            name: "Switch",
            props: { label: "Push notifications", value: String(preferences.notifications) },
          },
          {
            name: "TextInput",
            props: { label: "Display name", value: preferences.displayName },
          },
          {
            name: "SegmentedControl",
            props: { label: "Density", value: preferences.density },
          },
        ],
        tokens: [
          { name: "--color-text-primary", role: "body text" },
          { name: "--color-background-card", role: "card surface" },
          { name: "--radius-container", role: "card radius" },
        ],
        preferencesSnapshot: preferences,
        notes: `@astryxdesign/core@${ASTRYX_VERSION} + theme-neutral@${ASTRYX_VERSION}`,
      },
      shadcn: {
        library: "shadcn",
        fixture,
        integrationMode: "real-package",
        components: [
          { name: "Card", props: { className: "rounded-lg border" } },
          {
            name: "Switch",
            props: { checked: String(preferences.notifications), "aria-label": "Push notifications" },
          },
          {
            name: "Input",
            props: { value: preferences.displayName, placeholder: "Display name" },
          },
          {
            name: "Button",
            props: { variant: "outline", size: "sm", role: "density toggle" },
          },
        ],
        tokens: [
          { name: "--background", role: "page background (shadcn CSS vars)" },
          { name: "--primary", role: "accent / focus" },
          { name: "--radius", role: "corner radius" },
        ],
        preferencesSnapshot: preferences,
        notes: `Vendored shadcn/ui (CLI ${SHADCN_CLI_VERSION}, base-mira preset)`,
      },
    }
  }

  return {
    astryx: {
      library: "astryx",
      fixture,
      integrationMode: "real-package",
      components: [
        { name: "Card", props: { variant: "muted", padding: "md" } },
        { name: "Text", props: { type: "headline", children: "Sample metric" } },
        { name: "Badge", props: { variant: "neutral", label: "Illustrative" } },
        { name: "Stack", props: { gap: preferences.density === "compact" ? "sm" : "md" } },
      ],
      tokens: [
        { name: "--color-background-muted", role: "metric card fill" },
        { name: "--spacing-4", role: "stack gap (comfortable)" },
        { name: "--spacing-2", role: "stack gap (compact)" },
      ],
      preferencesSnapshot: preferences,
      notes: `Dashboard uses deterministic sample metrics; notifications=${preferences.notifications}.`,
    },
    shadcn: {
      library: "shadcn",
      fixture,
      integrationMode: "real-package",
      components: [
        { name: "Card", props: { size: "sm" } },
        { name: "Badge", props: { variant: "secondary" } },
        { name: "CardTitle", props: { children: "Sample metric" } },
      ],
      tokens: [
        { name: "--card", role: "metric tile background" },
        { name: "--muted-foreground", role: "supporting labels" },
        { name: "--border", role: "tile outline" },
      ],
      preferencesSnapshot: preferences,
      notes: `Dashboard uses deterministic sample metrics; displayName=${preferences.displayName}.`,
    },
  }
}

export function specToJson(
  fixture: FixtureId,
  preferences: LabPreferences,
): string {
  const spec = buildSpec(fixture, preferences)
  return JSON.stringify(
    {
      generatedAt: new Date(0).toISOString(),
      illustrative: true,
      fixture,
      entries: [spec.astryx, spec.shadcn],
    },
    null,
    2,
  )
}

/** Deterministic export for tests (fixed timestamp). */
export function specToJsonDeterministic(
  fixture: FixtureId,
  preferences: LabPreferences,
): string {
  const spec = buildSpec(fixture, preferences)
  return JSON.stringify(
    {
      generatedAt: "1970-01-01T00:00:00.000Z",
      illustrative: true,
      fixture,
      entries: [spec.astryx, spec.shadcn],
    },
    null,
    2,
  )
}
