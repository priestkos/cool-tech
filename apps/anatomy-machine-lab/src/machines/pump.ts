import type { MachineDefinition, PartPose, Readout } from "../lib/types"

const STROKE_SECONDS = 2
export const PUMP_CYCLE = STROKE_SECONDS * 2

export const pumpParts = [
  {
    id: "handle",
    label: "Handle",
    description: "Manual lever that drives the piston up and down.",
  },
  {
    id: "cylinder",
    label: "Cylinder",
    description: "Chamber where water is drawn in and pushed out.",
  },
  {
    id: "piston",
    label: "Piston",
    description: "Sealed plunger that changes chamber volume.",
  },
  {
    id: "valve-in",
    label: "Inlet check valve",
    description: "Opens on the upstroke to admit water.",
  },
  {
    id: "valve-out",
    label: "Outlet check valve",
    description: "Opens on the downstroke to expel water.",
  },
  {
    id: "outlet",
    label: "Outlet pipe",
    description: "Delivers pumped water to the destination.",
  },
] as const

export function pumpState(t: number): {
  strokePos: number
  inletOpen: boolean
  outletOpen: boolean
  mlPerStroke: number
  totalMl: number
} {
  const phase = (t % PUMP_CYCLE) / STROKE_SECONDS
  const strokePos = phase <= 1 ? phase : 2 - phase
  const upstroke = phase <= 1
  const inletOpen = upstroke
  const outletOpen = !upstroke
  const mlPerStroke = 45
  const completedStrokes = Math.floor(t / STROKE_SECONDS) * 0.5
  const totalMl = completedStrokes * mlPerStroke + (outletOpen ? strokePos * mlPerStroke * 0.5 : 0)
  return {
    strokePos,
    inletOpen,
    outletOpen,
    mlPerStroke,
    totalMl: Math.max(0, totalMl),
  }
}

export function pumpPartPoses(t: number, dark: boolean): PartPose[] {
  const s = pumpState(t)
  const metal = dark ? "#64748b" : "#94a3b8"
  const valveIn = s.inletOpen ? "#22c55e" : "#64748b"
  const valveOut = s.outletOpen ? "#22c55e" : "#64748b"
  const pistonZ = 0.4 + s.strokePos * 1.2
  return [
    {
      partId: "handle",
      position: { x: 0, y: 1.5, z: pistonZ + 1.4 },
      size: { x: 0.2, y: 1.2, z: 0.2 },
      rotationZ: s.strokePos * 0.4 - 0.2,
      fill: dark ? "#a16207" : "#ca8a04",
      stroke: "#713f12",
    },
    {
      partId: "cylinder",
      position: { x: 1.5, y: 1.2, z: 0 },
      size: { x: 1, y: 1, z: 2.4 },
      rotationZ: 0,
      fill: dark ? "#334155" : "#e2e8f0",
      stroke: "#0f172a",
    },
    {
      partId: "piston",
      position: { x: 1.55, y: 1.25, z: pistonZ },
      size: { x: 0.9, y: 0.9, z: 0.25 },
      rotationZ: 0,
      fill: metal,
      stroke: "#1e293b",
    },
    {
      partId: "valve-in",
      position: { x: 1.55, y: 0.4, z: 0.3 },
      size: { x: 0.5, y: 0.5, z: 0.35 },
      rotationZ: 0,
      fill: valveIn,
      stroke: "#14532d",
    },
    {
      partId: "valve-out",
      position: { x: 2.6, y: 1.25, z: 1.2 },
      size: { x: 0.45, y: 0.45, z: 0.35 },
      rotationZ: 0,
      fill: valveOut,
      stroke: "#14532d",
    },
    {
      partId: "outlet",
      position: { x: 3.1, y: 1.1, z: 1.1 },
      size: { x: 1.2, y: 0.4, z: 0.4 },
      rotationZ: 0,
      fill: dark ? "#0ea5e9" : "#0284c7",
      stroke: "#0c4a6e",
    },
  ]
}

export function pumpReadouts(t: number): Readout[] {
  const s = pumpState(t)
  return [
    {
      id: "stroke",
      label: "Stroke position",
      value: s.strokePos.toFixed(2),
    },
    {
      id: "inlet",
      label: "Inlet valve",
      value: s.inletOpen ? "Open" : "Closed",
    },
    {
      id: "outlet-valve",
      label: "Outlet valve",
      value: s.outletOpen ? "Open" : "Closed",
    },
    {
      id: "per-stroke",
      label: "Flow per stroke (ml)",
      value: s.mlPerStroke.toFixed(0),
    },
    {
      id: "total",
      label: "Total pumped (ml)",
      value: s.totalMl.toFixed(1),
    },
  ]
}

export function pumpMachine(dark: boolean): MachineDefinition {
  return {
    id: "pump",
    title: "Hand water pump",
    subtitle: "Piston, check valves, and stroke readouts",
    cycleSeconds: 16,
    parts: [...pumpParts],
    partPoses: (t) => pumpPartPoses(t, dark),
    readouts: pumpReadouts,
    effectHints: (t) => {
    const s = pumpState(t)
    if (s.outletOpen && s.strokePos > 0.2) {
      return [
        {
          kind: "water",
          x: 420,
          y: 220,
          intensity: s.strokePos,
        },
      ]
    }
    return []
  },
  }
}
