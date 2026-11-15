import { useCallback, useMemo, useState } from "react"
import type { SceneLabFile } from "@/features/scene/schema"
import { parseSceneLabJson, serializeSceneLab } from "@/features/scene/schema"
import { SAMPLE_SCENES, sampleBySlug } from "@/features/scene/samples"

const DEFAULT_SLUG = "noon-courtyard"

export function useSceneLab() {
  const initial = useMemo(
    () => sampleBySlug(DEFAULT_SLUG)?.scene ?? SAMPLE_SCENES[0].scene,
    []
  )

  const [scene, setScene] = useState<SceneLabFile>(initial)
  const [jsonText, setJsonText] = useState(() => serializeSceneLab(initial))
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [activeSlug, setActiveSlug] = useState(DEFAULT_SLUG)

  const syncJsonFromScene = useCallback((next: SceneLabFile) => {
    setScene(next)
    setJsonText(serializeSceneLab(next))
    setParseErrors([])
  }, [])

  const applyJson = useCallback(() => {
    const result = parseSceneLabJson(jsonText)
    if (!result.ok) {
      setParseErrors(result.errors)
      return false
    }
    setScene(result.scene)
    setParseErrors([])
    return true
  }, [jsonText])

  const loadSample = useCallback(
    (slug: string) => {
      const sample = sampleBySlug(slug)
      if (!sample) return
      setActiveSlug(slug)
      syncJsonFromScene(sample.scene)
    },
    [syncJsonFromScene]
  )

  const patchSun = useCallback(
    (patch: Partial<SceneLabFile["environment"]["sun"]>) => {
      setScene((prev) => {
        const next: SceneLabFile = {
          ...prev,
          environment: {
            ...prev.environment,
            sun: { ...prev.environment.sun, ...patch },
          },
        }
        setJsonText(serializeSceneLab(next))
        setParseErrors([])
        return next
      })
    },
    []
  )

  const patchRenderer = useCallback(
    (patch: Partial<SceneLabFile["renderer"]>) => {
      setScene((prev) => {
        const next: SceneLabFile = {
          ...prev,
          renderer: { ...prev.renderer, ...patch },
        }
        setJsonText(serializeSceneLab(next))
        setParseErrors([])
        return next
      })
    },
    []
  )

  return {
    scene,
    jsonText,
    setJsonText,
    parseErrors,
    applyJson,
    loadSample,
    activeSlug,
    patchSun,
    patchRenderer,
    samples: SAMPLE_SCENES,
  }
}