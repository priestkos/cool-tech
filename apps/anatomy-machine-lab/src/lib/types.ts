export type Vec3 = { x: number; y: number; z: number }

export type MachineId = "clock" | "coffee" | "pump"

export type PartDefinition = {
  id: string
  label: string
  description: string
}

export type PartPose = {
  partId: string
  position: Vec3
  size: Vec3
  rotationZ: number
  fill: string
  stroke: string
}

export type Readout = {
  id: string
  label: string
  value: string
}

export type MachineDefinition = {
  id: MachineId
  title: string
  subtitle: string
  cycleSeconds: number
  parts: PartDefinition[]
  partPoses: (t: number) => PartPose[]
  readouts: (t: number) => Readout[]
  effectHints?: (t: number) => EffectHint[]
}

export type EffectHint =
  | { kind: "steam"; x: number; y: number; intensity: number }
  | { kind: "water"; x: number; y: number; intensity: number }
  | { kind: "glow"; x: number; y: number; intensity: number; color: string }
