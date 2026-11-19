import { useCallback, useState } from "react"
import type { AxisState } from "@/lib/allo-axes"
import { AXIS_RANGES, clampAxis } from "@/lib/allo-axes"
import type { FeatureId, FeatureState } from "@/lib/allo-features"
import { DEFAULT_FEATURES } from "@/lib/allo-features"
import { applyPreset, type PresetId } from "@/lib/allo-presets"

const DEFAULT_AXES: AxisState = {
  wght: AXIS_RANGES.wght.default,
  rond: AXIS_RANGES.ROND.default,
  opsz: AXIS_RANGES.opsz.default,
  autoOpsz: true,
}

export function useAlloLab() {
  const [axes, setAxes] = useState<AxisState>(DEFAULT_AXES)
  const [features, setFeatures] = useState<FeatureState>({ ...DEFAULT_FEATURES })
  const [activePreset, setActivePreset] = useState<PresetId | null>("neutral")

  const setWght = useCallback((wght: number) => {
    setAxes((a) => ({ ...a, wght: clampAxis("wght", wght) }))
    setActivePreset(null)
  }, [])

  const setRond = useCallback((rond: number) => {
    setAxes((a) => ({ ...a, rond: clampAxis("ROND", rond) }))
    setActivePreset(null)
  }, [])

  const setOpsz = useCallback((opsz: number) => {
    setAxes((a) => ({ ...a, opsz: clampAxis("opsz", opsz) }))
  }, [])

  const setAutoOpsz = useCallback((autoOpsz: boolean) => {
    setAxes((a) => ({ ...a, autoOpsz }))
  }, [])

  const setFromPad = useCallback((wght: number, rond: number) => {
    setAxes((a) => ({
      ...a,
      wght: clampAxis("wght", wght),
      rond: clampAxis("ROND", rond),
    }))
    setActivePreset(null)
  }, [])

  const toggleFeature = useCallback((id: FeatureId, on: boolean) => {
    setFeatures((f) => ({ ...f, [id]: on }))
  }, [])

  const applyPersonalityPreset = useCallback((id: PresetId) => {
    setAxes((a) => applyPreset(id, a))
    setActivePreset(id)
  }, [])

  return {
    axes,
    features,
    activePreset,
    setWght,
    setRond,
    setOpsz,
    setAutoOpsz,
    setFromPad,
    toggleFeature,
    applyPersonalityPreset,
  }
}