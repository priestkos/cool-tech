import type { MachineDefinition, PartPose, Readout } from "../lib/types"

const CYCLE = 36

export const coffeeParts = [
  {
    id: "reservoir",
    label: "Water reservoir",
    description: "Stores cold water before heating.",
  },
  {
    id: "heater",
    label: "Heater coil",
    description: "Brings water to pour-over temperature (~92°C).",
  },
  {
    id: "pump",
    label: "Pump",
    description: "Pressurizes hot water toward the shower head.",
  },
  {
    id: "shower",
    label: "Shower head",
    description: "Spreads water evenly over the coffee bed.",
  },
  {
    id: "cone",
    label: "Filter cone",
    description: "Holds the paper filter and ground coffee.",
  },
  {
    id: "carafe",
    label: "Carafe",
    description: "Collects brewed coffee below the cone.",
  },
] as const

export function coffeeState(t: number): {
  tempC: number
  flowMlPerSec: number
  volumeMl: number
  extractionSec: number
  phase: "heat" | "brew" | "finish"
} {
  const heatEnd = 8
  const brewEnd = 28
  let tempC = 22
  let flowMlPerSec = 0
  let volumeMl = 0
  let phase: "heat" | "brew" | "finish" = "heat"

  if (t <= heatEnd) {
    tempC = 22 + (70 * t) / heatEnd
    phase = "heat"
  } else if (t <= brewEnd) {
    tempC = 92 - (t - heatEnd) * 0.15
    flowMlPerSec = 2.4 + Math.sin(t * 3) * 0.2
    const brewT = t - heatEnd
    volumeMl = brewT * 2.5
    phase = "brew"
  } else {
    tempC = 88 - (t - brewEnd) * 0.05
    flowMlPerSec = Math.max(0, 0.8 - (t - brewEnd) * 0.2)
    volumeMl = 50 + (t - brewEnd) * 0.3
    phase = "finish"
  }

  const extractionSec = Math.max(0, Math.min(t, brewEnd) - heatEnd)
  return {
    tempC: Math.max(20, tempC),
    flowMlPerSec: Math.max(0, flowMlPerSec),
    volumeMl: Math.max(0, volumeMl),
    extractionSec,
    phase,
  }
}

export function coffeePartPoses(t: number, dark: boolean): PartPose[] {
  const s = coffeeState(t)
  const water = dark ? "#38bdf8" : "#0ea5e9"
  const metal = dark ? "#71717a" : "#a8a29e"
  const heat = dark ? "#f97316" : "#ea580c"
  const fillLevel = Math.min(1, s.volumeMl / 50)
  return [
    {
      partId: "reservoir",
      position: { x: 0, y: 2.5, z: 0 },
      size: { x: 1.5, y: 1.5, z: 2 },
      rotationZ: 0,
      fill: dark ? "#1e3a5f" : "#bae6fd",
      stroke: "#0c4a6e",
    },
    {
      partId: "heater",
      position: { x: 0.2, y: 2.7, z: 0.2 },
      size: { x: 1.1, y: 1.1, z: 0.4 },
      rotationZ: 0,
      fill: heat,
      stroke: "#7c2d12",
    },
    {
      partId: "pump",
      position: { x: 1.8, y: 2.6, z: 0.5 },
      size: { x: 0.8, y: 0.8, z: 0.8 },
      rotationZ: t * 4,
      fill: metal,
      stroke: "#27272a",
    },
    {
      partId: "shower",
      position: { x: 2.8, y: 1.2, z: 2.2 },
      size: { x: 1.6, y: 1.6, z: 0.2 },
      rotationZ: 0,
      fill: metal,
      stroke: "#44403c",
    },
    {
      partId: "cone",
      position: { x: 2.6, y: 0.8, z: 1.2 },
      size: { x: 1.2, y: 1.2, z: 1 },
      rotationZ: 0,
      fill: dark ? "#57534e" : "#d6d3d1",
      stroke: "#292524",
    },
    {
      partId: "carafe",
      position: { x: 2.5, y: 0.6, z: 0 },
      size: { x: 1.4, y: 1.4, z: 0.2 + fillLevel * 1.2 },
      rotationZ: 0,
      fill: water,
      stroke: "#0369a1",
    },
  ]
}

export function coffeeReadouts(t: number): Readout[] {
  const s = coffeeState(t)
  return [
    { id: "temp", label: "Water temp (°C)", value: s.tempC.toFixed(1) },
    {
      id: "flow",
      label: "Flow (ml/s)",
      value: s.flowMlPerSec.toFixed(2),
    },
    {
      id: "volume",
      label: "Brew volume (ml)",
      value: s.volumeMl.toFixed(1),
    },
    {
      id: "extract",
      label: "Extraction time (s)",
      value: s.extractionSec.toFixed(1),
    },
  ]
}

export function coffeeMachine(dark: boolean): MachineDefinition {
  return {
    id: "coffee",
    title: "Pour-over coffee machine",
    subtitle: "Heat, pump, shower, and carafe readouts",
    cycleSeconds: CYCLE,
    parts: [...coffeeParts],
    partPoses: (t) => coffeePartPoses(t, dark),
    readouts: coffeeReadouts,
    effectHints: (t) => {
    const s = coffeeState(t)
    const hints = []
    if (s.phase === "heat" || s.tempC > 85) {
      hints.push({
        kind: "steam" as const,
        x: 140,
        y: 120,
        intensity: Math.min(1, (s.tempC - 60) / 40),
      })
    }
    if (s.flowMlPerSec > 0.5) {
      hints.push({
        kind: "water" as const,
        x: 360,
        y: 200,
        intensity: s.flowMlPerSec / 3,
      })
    }
    return hints
  },
  }
}
