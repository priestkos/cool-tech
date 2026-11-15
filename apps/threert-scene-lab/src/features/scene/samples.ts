import type { SceneLabFile } from "./schema"
import { SCENE_LAB_VERSION } from "./schema"

export type SampleScene = {
  slug: string
  blurb: string
  scene: SceneLabFile
}

const base = (
  name: string,
  description: string,
  partial: Pick<SceneLabFile, "environment" | "meshes" | "lights" | "renderer">
): SceneLabFile => ({
  version: SCENE_LAB_VERSION,
  meta: { name, description },
  ...partial,
})

export const SAMPLE_SCENES: SampleScene[] = [
  {
    slug: "noon-courtyard",
    blurb: "High sun, pale stone courtyard, low skylight fill.",
    scene: base("Noon courtyard", "Original lab scene — not from ThreeRT samples.", {
      environment: {
        sun: { azimuthDeg: 210, elevationDeg: 62, illuminanceLux: 90_000 },
        sky: { preset: "clear" },
        hemisphereLux: 8_000,
      },
      renderer: { exposure: 1.05, toneMapping: "aces" },
      meshes: [
        {
          id: "ground",
          name: "Courtyard",
          geometry: "plane",
          size: [24, 24, 0],
          position: [0, 0, 0],
          rotation: [-Math.PI / 2, 0, 0],
          material: { color: "#c8b89a", roughness: 0.85, metalness: 0.02 },
        },
        {
          id: "fountain",
          geometry: "cylinder",
          size: [1.2, 2.4, 0],
          position: [0, 1.2, 0],
          material: { color: "#9aa8b8", roughness: 0.35, metalness: 0.4 },
        },
        {
          id: "wall-n",
          geometry: "box",
          size: [18, 4, 0.6],
          position: [0, 2, -10],
          material: { color: "#e8e0d4", roughness: 0.9, metalness: 0 },
        },
        {
          id: "bench",
          geometry: "box",
          size: [4, 0.5, 1.2],
          position: [5, 0.25, 4],
          material: { color: "#7a5c42", roughness: 0.7, metalness: 0.05 },
        },
      ],
      lights: [],
    }),
  },
  {
    slug: "night-street",
    blurb: "Emissive lamp posts and warm spots — no sun.",
    scene: base("Night street", "Emissive lamps with point fill.", {
      environment: {
        sun: { azimuthDeg: 270, elevationDeg: -10, illuminanceLux: 0 },
        sky: { preset: "night" },
        hemisphereLux: 120,
      },
      renderer: { exposure: 0.85, toneMapping: "aces" },
      meshes: [
        {
          id: "street",
          geometry: "plane",
          size: [40, 14, 0],
          position: [0, 0, 0],
          rotation: [-Math.PI / 2, 0, 0],
          material: { color: "#2a2f38", roughness: 0.95, metalness: 0.1 },
        },
        {
          id: "building-a",
          geometry: "box",
          size: [8, 12, 20],
          position: [-10, 6, -4],
          material: { color: "#3d4654", roughness: 0.8, metalness: 0.05 },
        },
        {
          id: "building-b",
          geometry: "box",
          size: [10, 14, 18],
          position: [12, 7, -2],
          material: { color: "#35404f", roughness: 0.75, metalness: 0.08 },
        },
        {
          id: "lamp-left",
          geometry: "sphere",
          size: [0.35, 0, 0],
          position: [-4, 3.2, 2],
          material: {
            color: "#ffdd99",
            emissive: { color: "#ffcc66", exitanceLmPerM2: 4200 },
            roughness: 0.4,
          },
        },
        {
          id: "lamp-right",
          geometry: "sphere",
          size: [0.35, 0, 0],
          position: [6, 3.2, 1],
          material: {
            color: "#ffdd99",
            emissive: { color: "#ffcc66", exitanceLmPerM2: 3800 },
            roughness: 0.4,
          },
        },
      ],
      lights: [
        {
          id: "post-a",
          type: "point",
          position: [-4, 3, 2],
          luminousFluxLm: 1200,
          distance: 18,
        },
        {
          id: "post-b",
          type: "point",
          position: [6, 3, 1],
          luminousFluxLm: 1000,
          distance: 16,
        },
      ],
    }),
  },
  {
    slug: "interior-window",
    blurb: "Single sun through a tall window, interior bounce.",
    scene: base("Interior window light", "Window wash + soft fill.", {
      environment: {
        sun: { azimuthDeg: 135, elevationDeg: 28, illuminanceLux: 22_000 },
        sky: { preset: "hazy" },
        hemisphereLux: 2_500,
      },
      renderer: { exposure: 1.1, toneMapping: "aces" },
      meshes: [
        {
          id: "floor",
          geometry: "plane",
          size: [12, 10, 0],
          position: [0, 0, 0],
          rotation: [-Math.PI / 2, 0, 0],
          material: { color: "#b9a992", roughness: 0.65, metalness: 0 },
        },
        {
          id: "back-wall",
          geometry: "plane",
          size: [12, 6, 0],
          position: [0, 3, -5],
          material: { color: "#efe8df", roughness: 0.92, metalness: 0 },
        },
        {
          id: "table",
          geometry: "box",
          size: [2.4, 0.08, 1.2],
          position: [1, 0.9, 0],
          material: { color: "#6d5340", roughness: 0.55, metalness: 0.05 },
        },
        {
          id: "vase",
          geometry: "cylinder",
          size: [0.25, 0.5, 0],
          position: [1, 1.15, 0],
          material: { color: "#88aacc", roughness: 0.25, metalness: 0.15 },
        },
      ],
      lights: [],
    }),
  },
  {
    slug: "studio-softbox",
    blurb: "Controlled spot key + low sun for product rim.",
    scene: base("Studio softbox", "Spot key with sun rim.", {
      environment: {
        sun: { azimuthDeg: 300, elevationDeg: 18, illuminanceLux: 4_000 },
        sky: { preset: "overcast" },
        hemisphereLux: 1_200,
      },
      renderer: { exposure: 1.0, toneMapping: "reinhard" },
      meshes: [
        {
          id: "stage",
          geometry: "plane",
          size: [10, 10, 0],
          position: [0, 0, 0],
          rotation: [-Math.PI / 2, 0, 0],
          material: { color: "#a8a8ae", roughness: 0.5, metalness: 0.2 },
        },
        {
          id: "product",
          geometry: "sphere",
          size: [0.9, 0, 0],
          position: [0, 0.9, 0],
          material: { color: "#e05a4f", roughness: 0.35, metalness: 0.6 },
        },
        {
          id: "backdrop",
          geometry: "box",
          size: [10, 6, 0.2],
          position: [0, 3, -4.5],
          material: { color: "#e8e8ee", roughness: 0.95, metalness: 0 },
        },
      ],
      lights: [
        {
          id: "key",
          type: "spot",
          position: [3, 5, 4],
          target: [0, 0.8, 0],
          intensityCd: 45_000,
          angleDeg: 38,
          penumbra: 0.35,
          distance: 30,
        },
      ],
    }),
  },
  {
    slug: "overcast-plaza",
    blurb: "Low sun illuminance, high hemisphere — flat outdoor light.",
    scene: base("Overcast plaza", "Diffuse exterior with metal accents.", {
      environment: {
        sun: { azimuthDeg: 180, elevationDeg: 35, illuminanceLux: 12_000 },
        sky: { preset: "overcast" },
        hemisphereLux: 14_000,
      },
      renderer: { exposure: 1.15, toneMapping: "aces" },
      meshes: [
        {
          id: "plaza",
          geometry: "plane",
          size: [30, 30, 0],
          position: [0, 0, 0],
          rotation: [-Math.PI / 2, 0, 0],
          material: { color: "#b0b5bc", roughness: 0.7, metalness: 0.15 },
        },
        {
          id: "sculpture",
          geometry: "cylinder",
          size: [0.6, 5, 0],
          position: [0, 2.5, 0],
          material: { color: "#8899aa", roughness: 0.2, metalness: 0.85 },
        },
        {
          id: "planter",
          geometry: "box",
          size: [3, 1, 3],
          position: [-5, 0.5, 3],
          material: { color: "#6a7d6c", roughness: 0.8, metalness: 0.05 },
        },
      ],
      lights: [],
    }),
  },
]

export function sampleBySlug(slug: string): SampleScene | undefined {
  return SAMPLE_SCENES.find((s) => s.slug === slug)
}