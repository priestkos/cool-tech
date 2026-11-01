export type SceneSource =
  | { kind: "vendored"; id: string; label: string; url: string; credit: string }
  | { kind: "streamed"; id: string; label: string; url: string; credit: string }
  | { kind: "file"; id: string; label: string; file: File }

export const DEFAULT_SCENE_ID = "sparkling_water"

export const SCENE_CATALOG: SceneSource[] = [
  {
    kind: "vendored",
    id: "sparkling_water",
    label: "Sparkling water (offline)",
    url: "/samples/sparkling_water.spz",
    credit:
      "CC0 1.0 — raymondyfei/SharedTestModels @ 92aec941 (sparkling_water.spz, 67,390 splats)",
  },
  {
    kind: "vendored",
    id: "a_cute_cat",
    label: "A cute cat (offline)",
    url: "/samples/a_cute_cat_float32.spz",
    credit:
      "CC0 1.0 — raymondyfei/SharedTestModels @ 92aec941 (a_cute_cat_float32.spz, 105,128 splats)",
  },
  {
    kind: "streamed",
    id: "seashell",
    label: "Seashell (streamed from the Radix sample host)",
    url: "https://storage.googleapis.com/forge-dev-public/asundqui/radix/261015/spz/seashell_v4.spz",
    credit:
      "CC0 1.0 — SharedTestModels via Radix sample host (seashell_v4.spz, streamed)",
  },
  {
    kind: "streamed",
    id: "scarf",
    label: "Scarf (streamed from the Radix sample host)",
    url: "https://storage.googleapis.com/forge-dev-public/asundqui/radix/261015/spz/scarf_v3.spz",
    credit: "CC0 1.0 — SharedTestModels via Radix sample host (scarf_v3.spz, streamed)",
  },
]

export function sceneById(id: string): SceneSource | undefined {
  return SCENE_CATALOG.find((s) => s.id === id)
}

export function catalogScene(id: string): Extract<SceneSource, { kind: "vendored" | "streamed" }> | undefined {
  const scene = sceneById(id)
  if (!scene || scene.kind === "file") return undefined
  return scene
}
