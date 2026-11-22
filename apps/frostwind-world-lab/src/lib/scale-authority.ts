// @ts-nocheck — vendored Frostwind ESM sources (MIT)
import {
  HUMAN_M,
  PLAYER_H,
  PX_PER_M,
  M_PER_PX,
  metresToPx,
  pxToMetres,
} from "../../vendor/frostwind/src/scale.js"
import { measureDeer, ROE_DEER_LIFE } from "../../vendor/frostwind/src/body-deer.js"

/** Rows shown in the scale table — values from the real compiler modules only. */
export type ScaleRow = {
  id: string
  label: string
  metres: number
  pixels: number
  formula: string
}

export function buildScaleTable(): ScaleRow[] {
  const roe = measureDeer()
  const roeMetres = ROE_DEER_LIFE.northBuck.bodyLengthM

  return [
    {
      id: "traveller",
      label: "Standing traveller",
      metres: HUMAN_M,
      pixels: PLAYER_H,
      formula: `PLAYER_H = ${PLAYER_H} px, HUMAN_M = ${HUMAN_M} m, PX_PER_M = PLAYER_H / HUMAN_M ≈ ${PX_PER_M.toFixed(2)}`,
    },
    {
      id: "traveller-inverse",
      label: "Metres per pixel (authority)",
      metres: M_PER_PX,
      pixels: 1,
      formula: `M_PER_PX = HUMAN_M / PLAYER_H ≈ ${M_PER_PX.toFixed(4)} m/px`,
    },
    {
      id: "roe-buck",
      label: "Roe buck (body length authority)",
      metres: roeMetres,
      pixels: roe.silhouetteLength,
      formula: `metresToPx(${roeMetres}) = ${metresToPx(roeMetres)} px; measureDeer().silhouetteLength = ${roe.silhouetteLength} px`,
    },
    {
      id: "roe-verify",
      label: "Roe buck via metresToPx",
      metres: roeMetres,
      pixels: metresToPx(roeMetres),
      formula: `README identity: 26 px = 1.70 m → buck ${roeMetres} m → ${metresToPx(roeMetres)} px`,
    },
  ]
}

export function assertScaleInvariants(rows: ScaleRow[]): boolean {
  const traveller = rows.find((r) => r.id === "traveller")
  const roe = rows.find((r) => r.id === "roe-buck")
  if (!traveller || !roe) return false
  return (
    traveller.pixels === PLAYER_H &&
    traveller.metres === HUMAN_M &&
    roe.pixels === 20 &&
    Math.abs(roe.metres - 1.18) < 1e-9 &&
    metresToPx(HUMAN_M) === PLAYER_H &&
    Math.abs(pxToMetres(PLAYER_H) - HUMAN_M) < 1e-12
  )
}