import type { MachineDefinition, PartPose, Readout } from "../lib/types"

const ESCAPEMENT_TEETH = 8
const INTERMEDIATE_TEETH = 64
const MINUTE_TEETH = 480
export const GEAR_RATIO = INTERMEDIATE_TEETH / ESCAPEMENT_TEETH
export const TICKS_PER_SECOND = 2

export const clockParts = [
  {
    id: "frame",
    label: "Frame",
    description: "Rigid plates that keep the gear train aligned.",
  },
  {
    id: "escapement",
    label: "Escapement",
    description: "Locks and releases the gear train once per tick.",
  },
  {
    id: "gear-escape",
    label: "Escape wheel",
    description: `${ESCAPEMENT_TEETH}-tooth wheel driven by the escapement.`,
  },
  {
    id: "gear-mid",
    label: "Intermediate gear",
    description: `${INTERMEDIATE_TEETH}-tooth wheel; turns ${GEAR_RATIO.toFixed(0)}× slower than the escape wheel.`,
  },
  {
    id: "gear-minute",
    label: "Minute wheel",
    description: "Large wheel that accumulates ticks into longer intervals.",
  },
  {
    id: "pendulum",
    label: "Pendulum",
    description: "Oscillator that sets the tick rate of the escapement.",
  },
] as const

export function clockState(t: number): {
  ticks: number
  escapeAngle: number
  midAngle: number
  minuteAngle: number
  pendulumAngle: number
} {
  const ticks = t * TICKS_PER_SECOND
  const escapeAngle = (ticks / ESCAPEMENT_TEETH) * Math.PI * 2
  const midAngle = escapeAngle / GEAR_RATIO
  const minuteAngle = escapeAngle * (ESCAPEMENT_TEETH / MINUTE_TEETH)
  const pendulumAngle = Math.sin(t * Math.PI * 2) * 0.35
  return { ticks, escapeAngle, midAngle, minuteAngle, pendulumAngle }
}

export function clockPartPoses(t: number, dark: boolean): PartPose[] {
  const s = clockState(t)
  const metal = dark ? "#64748b" : "#94a3b8"
  const accent = dark ? "#fbbf24" : "#d97706"
  const frame = dark ? "#334155" : "#cbd5e1"
  return [
    {
      partId: "frame",
      position: { x: -1, y: -0.5, z: 0 },
      size: { x: 6, y: 4, z: 0.3 },
      rotationZ: 0,
      fill: frame,
      stroke: dark ? "#0f172a" : "#475569",
    },
    {
      partId: "escapement",
      position: { x: 1.2, y: 1.4, z: 0.4 },
      size: { x: 1.2, y: 0.6, z: 0.5 },
      rotationZ: Math.sin(t * Math.PI * 4) * 0.15,
      fill: accent,
      stroke: "#78350f",
    },
    {
      partId: "gear-escape",
      position: { x: 2.5, y: 1.5, z: 0.35 },
      size: { x: 1.4, y: 1.4, z: 0.25 },
      rotationZ: s.escapeAngle,
      fill: metal,
      stroke: "#1e293b",
    },
    {
      partId: "gear-mid",
      position: { x: 2.4, y: 0.2, z: 0.45 },
      size: { x: 1.8, y: 1.8, z: 0.2 },
      rotationZ: s.midAngle,
      fill: dark ? "#475569" : "#64748b",
      stroke: "#0f172a",
    },
    {
      partId: "gear-minute",
      position: { x: 0.6, y: 0.4, z: 0.55 },
      size: { x: 2.2, y: 2.2, z: 0.15 },
      rotationZ: s.minuteAngle,
      fill: dark ? "#71717a" : "#a1a1aa",
      stroke: "#27272a",
    },
    {
      partId: "pendulum",
      position: { x: 4.2, y: 2.2, z: 0 },
      size: { x: 0.15, y: 0.15, z: 2.2 },
      rotationZ: s.pendulumAngle,
      fill: accent,
      stroke: "#451a03",
    },
  ]
}

export function clockReadouts(t: number): Readout[] {
  const s = clockState(t)
  const escapeRpm = (TICKS_PER_SECOND / ESCAPEMENT_TEETH) * 60
  const midRpm = escapeRpm / GEAR_RATIO
  return [
    {
      id: "escape-rpm",
      label: "Escape wheel RPM",
      value: escapeRpm.toFixed(2),
    },
    {
      id: "mid-rpm",
      label: "Intermediate RPM",
      value: midRpm.toFixed(3),
    },
    {
      id: "ratio",
      label: "Gear ratio (mid:escape)",
      value: `${GEAR_RATIO.toFixed(0)} : 1`,
    },
    {
      id: "ticks",
      label: "Elapsed ticks",
      value: s.ticks.toFixed(2),
    },
  ]
}

export function clockMachine(dark: boolean): MachineDefinition {
  return {
    id: "clock",
    title: "Mechanical clock gearbox",
    subtitle: "Escapement, gear train, and tick readouts",
    cycleSeconds: 24,
    parts: [...clockParts],
    partPoses: (t) => clockPartPoses(t, dark),
    readouts: clockReadouts,
    effectHints: (t) => {
      const s = clockState(t)
      const tickFraction = s.ticks - Math.floor(s.ticks)
      if (tickFraction > 0.92 || tickFraction < 0.08) {
        return [
          {
            kind: "glow",
            x: 320,
            y: 180,
            intensity: 0.6,
            color: "#fbbf24",
          },
        ]
      }
      return []
    },
  }
}
