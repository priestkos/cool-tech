import type { SceneDocument } from "./document"
import { SCENE_DOC_VERSION } from "./document"

export type SampleScene = {
  slug: string
  blurb: string
  doc: SceneDocument
}

const base = (
  name: string,
  description: string,
  partial: Pick<SceneDocument, "environment" | "meshes" | "lights" | "preview" | "camera">
): SceneDocument => ({
  version: SCENE_DOC_VERSION,
  meta: { name, description },
  ...partial,
})

export const SAMPLE_SCENES: SampleScene[] = [
  {
    slug: "noon-courtyard",
    blurb: "High sun lux, pale stone courtyard — built with @threert/scene.",
    doc: base("Noon courtyard", "Lab sample using SkyAtmosphere + lux sun.", {
      environment: {
        sun: { azimuthDeg: 210, elevationDeg: 62, illuminanceLux: 90_000 },
        sky: { preset: "clear" },
      },
      preview: { exposure: 1.05, toneMapping: "aces" },
      camera: { fov: 48, position: [14, 9, 16], lookAt: [0, 1.2, 0] },
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
    blurb: "Emissive lamps (nits) and point lights (cd) — no sun.",
    doc: base("Night street", "Emissive + PointLight candela.", {
      environment: {
        sun: { azimuthDeg: 270, elevationDeg: -10, illuminanceLux: 0 },
        sky: { preset: "night" },
      },
      preview: { exposure: 0.85, toneMapping: "aces" },
      camera: { fov: 50, position: [18, 6, 14], lookAt: [0, 2, 0] },
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
            emissive: { color: "#ffcc66", intensityNits: 3200 },
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
            emissive: { color: "#ffcc66", intensityNits: 2800 },
            roughness: 0.4,
          },
        },
      ],
      lights: [
        {
          id: "post-a",
          type: "point",
          position: [-4, 3, 2],
          intensityCd: 18_000,
          distance: 18,
        },
        {
          id: "post-b",
          type: "point",
          position: [6, 3, 1],
          intensityCd: 15_000,
          distance: 16,
        },
      ],
    }),
  },
  {
    slug: "interior-window",
    blurb: "Window sun at 22k lux, interior bounce.",
    doc: base("Interior window light", "Lower sun elevation through opening.", {
      environment: {
        sun: { azimuthDeg: 135, elevationDeg: 28, illuminanceLux: 22_000 },
        sky: { preset: "hazy" },
      },
      preview: { exposure: 1.1, toneMapping: "aces" },
      camera: { fov: 46, position: [8, 5, 10], lookAt: [1, 0.8, 0] },
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
    blurb: "Spot key in cd with rim sun.",
    doc: base("Studio softbox", "SpotLight + low sun.", {
      environment: {
        sun: { azimuthDeg: 300, elevationDeg: 18, illuminanceLux: 4_000 },
        sky: { preset: "overcast" },
      },
      preview: { exposure: 1.0, toneMapping: "reinhard" },
      camera: { fov: 42, position: [5, 4, 8], lookAt: [0, 0.8, 0] },
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
    blurb: "Diffuse exterior under overcast sky.",
    doc: base("Overcast plaza", "Moderate sun + metal sculpture.", {
      environment: {
        sun: { azimuthDeg: 180, elevationDeg: 35, illuminanceLux: 12_000 },
        sky: { preset: "overcast" },
      },
      preview: { exposure: 1.15, toneMapping: "aces" },
      camera: { fov: 48, position: [16, 7, 18], lookAt: [0, 2, 0] },
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