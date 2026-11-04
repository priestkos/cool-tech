import type { MachineDefinition } from "../lib/types"
import { clockMachine } from "./clock"
import { coffeeMachine } from "./coffee"
import { pumpMachine } from "./pump"

export function getMachines(dark: boolean): MachineDefinition[] {
  return [clockMachine(dark), coffeeMachine(dark), pumpMachine(dark)]
}

export { clockMachine, coffeeMachine, pumpMachine }
