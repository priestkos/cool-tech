import { useCallback, useState } from "react"
import {
  POND_DEFAULTS,
  type PondLabState,
  type PondLook,
  type WaterOverride,
  toKoiPondProps,
} from "./defaults"

export function usePondLab() {
  const [state, setState] = useState<PondLabState>({ ...POND_DEFAULTS })
  const [feedX, setFeedX] = useState(0.5)
  const [feedY, setFeedY] = useState(0.5)
  const [heroSharesLook, setHeroSharesLook] = useState(true)

  const patch = useCallback((partial: Partial<PondLabState>) => {
    setState((prev) => ({ ...prev, ...partial }))
  }, [])

  const setLook = useCallback((look: PondLook) => {
    patch({ look })
  }, [patch])

  const setWater = useCallback((water: Partial<WaterOverride>) => {
    setState((prev) => ({ ...prev, water: { ...prev.water, ...water } }))
  }, [])

  const reset = useCallback(() => {
    setState({ ...POND_DEFAULTS })
    setFeedX(0.5)
    setFeedY(0.5)
  }, [])

  return {
    state,
    pondProps: toKoiPondProps(state),
    heroLook: heroSharesLook ? state.look : ("natural" as const),
    heroSharesLook,
    setHeroSharesLook,
    feedX,
    feedY,
    setFeedX,
    setFeedY,
    patch,
    setLook,
    setWater,
    reset,
  }
}

export type PondLab = ReturnType<typeof usePondLab>