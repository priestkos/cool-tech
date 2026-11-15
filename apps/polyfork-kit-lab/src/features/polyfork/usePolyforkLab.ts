import { useCallback, useEffect, useMemo, useState } from "react"
import {
  assetTypes,
  filterAssets,
  loadCatalogSnapshot,
} from "./catalog"
import {
  defaultKnobValues,
  schemaToKnobs,
  paramsUrlForAsset,
} from "./knobs"
import { meshModesForNetwork } from "./modes"
import type {
  CatalogAsset,
  CatalogSnapshot,
  ComposerPart,
  KnobDef,
  KnobValues,
  LoadTiming,
  NetworkMode,
  PreviewMeshMode,
} from "./types"
import { placePart, movePart, rotatePart, removePart } from "./composer"
import { mockCreateAsset } from "./mock-parametric"
import { guardedFetch } from "./network"

export function usePolyforkLab() {
  const [catalog, setCatalog] = useState<CatalogSnapshot | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [networkMode, setNetworkMode] = useState<NetworkMode>("offline")
  const [meshMode, setMeshMode] = useState<PreviewMeshMode>("placeholder")
  const [query, setQuery] = useState("")
  const [kitFilter, setKitFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [knobs, setKnobs] = useState<KnobDef[]>([])
  const [knobValues, setKnobValues] = useState<KnobValues>({})
  const [composerParts, setComposerParts] = useState<ComposerPart[]>([])
  const [composerKit, setComposerKit] = useState<string | null>(null)
  const [selectedComposerId, setSelectedComposerId] = useState<string | null>(
    null
  )
  const [lastLoadTiming, setLastLoadTiming] = useState<LoadTiming | null>(null)

  useEffect(() => {
    loadCatalogSnapshot()
      .then(setCatalog)
      .catch((e) => setLoadError(String(e)))
  }, [])

  const filtered = useMemo(() => {
    if (!catalog) return []
    return filterAssets(catalog.assets, query, kitFilter, typeFilter)
  }, [catalog, query, kitFilter, typeFilter])

  const selected = useMemo(
    () => catalog?.assets.find((a) => a.id === selectedId) ?? null,
    [catalog, selectedId]
  )

  const types = useMemo(
    () => (catalog ? assetTypes(catalog.assets) : []),
    [catalog]
  )

  const allowedMeshModes = meshModesForNetwork(networkMode)

  useEffect(() => {
    if (!allowedMeshModes.includes(meshMode)) {
      setMeshMode(allowedMeshModes[0]!)
    }
  }, [allowedMeshModes, meshMode])

  const loadKnobsForAsset = useCallback(
    async (asset: CatalogAsset) => {
      const url = paramsUrlForAsset(asset.id, networkMode === "live")
      try {
        const res =
          networkMode === "live"
            ? await guardedFetch(networkMode, url)
            : await fetch(url)
        if (!res.ok) {
          setKnobs([])
          setKnobValues({})
          return
        }
        const schema = await res.json()
        const defs = schemaToKnobs(schema)
        setKnobs(defs)
        setKnobValues(defaultKnobValues(defs))
      } catch {
        setKnobs([])
        setKnobValues({})
      }
    },
    [networkMode]
  )

  const selectAsset = useCallback(
    (asset: CatalogAsset) => {
      setSelectedId(asset.id)
      void loadKnobsForAsset(asset)
      setLastLoadTiming(null)
    },
    [loadKnobsForAsset]
  )

  const setKnob = useCallback((key: string, value: string | number | boolean) => {
    setKnobValues((v) => ({ ...v, [key]: value }))
  }, [])

  const onNetworkMode = useCallback((mode: NetworkMode) => {
    setNetworkMode(mode)
    setLastLoadTiming(null)
  }, [])

  const recordTiming = useCallback((t: LoadTiming) => {
    setLastLoadTiming(t)
  }, [])

  const addToComposer = useCallback(() => {
    if (!selected) return
    const col = composerParts.length % 4
    const row = Math.floor(composerParts.length / 4)
    setComposerParts((p) =>
      placePart(p, selected, col * 2.5, row * 2.5)
    )
    if (!composerKit) setComposerKit(selected.kit)
  }, [selected, composerParts.length, composerKit])

  const kitAssetsForComposer = useMemo(() => {
    if (!catalog || !composerKit) return []
    return catalog.assets.filter((a) => a.kit === composerKit)
  }, [catalog, composerKit])

  return {
    catalog,
    loadError,
    networkMode,
    setNetworkMode: onNetworkMode,
    meshMode,
    setMeshMode,
    allowedMeshModes,
    query,
    setQuery,
    kitFilter,
    setKitFilter,
    typeFilter,
    setTypeFilter,
    filtered,
    types,
    selected,
    selectAsset,
    knobs,
    knobValues,
    setKnob,
    composerParts,
    setComposerParts,
    composerKit,
    setComposerKit,
    selectedComposerId,
    setSelectedComposerId,
    addToComposer,
    kitAssetsForComposer,
    moveComposerPart: (id: string, x: number, z: number) =>
      setComposerParts((p) => movePart(p, id, x, z)),
    rotateComposerPart: (id: string, d: number) =>
      setComposerParts((p) => rotatePart(p, id, d)),
    removeComposerPart: (id: string) =>
      setComposerParts((p) => removePart(p, id)),
    lastLoadTiming,
    recordTiming,
    mockCreateAsset,
  }
}

export type PolyforkLab = ReturnType<typeof usePolyforkLab>