import { useCallback, useMemo, useState } from "react"
import { buildThreertScene, type BuiltThreertScene } from "@/features/scene/build"
import type { SceneDocument } from "@/features/scene/document"
import {
  parseSceneDocumentJson,
  serializeSceneDocument,
} from "@/features/scene/document"
import { SAMPLE_SCENES, sampleBySlug } from "@/features/scene/samples"

const DEFAULT_SLUG = "noon-courtyard"

export function useSceneLab() {
  const initialDoc = useMemo(
    () => sampleBySlug(DEFAULT_SLUG)?.doc ?? SAMPLE_SCENES[0].doc,
    []
  )

  const [doc, setDoc] = useState<SceneDocument>(initialDoc)
  const [built, setBuilt] = useState<BuiltThreertScene>(() =>
    buildThreertScene(initialDoc)
  )
  const [jsonText, setJsonText] = useState(() => serializeSceneDocument(initialDoc))
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [activeSlug, setActiveSlug] = useState(DEFAULT_SLUG)

  const rebuild = useCallback((next: SceneDocument) => {
    setDoc(next)
    setBuilt(buildThreertScene(next))
    setJsonText(serializeSceneDocument(next))
    setParseErrors([])
  }, [])

  const applyJson = useCallback(() => {
    const result = parseSceneDocumentJson(jsonText)
    if (!result.ok) {
      setParseErrors(result.errors)
      return false
    }
    rebuild(result.doc)
    setActiveSlug("")
    return true
  }, [jsonText, rebuild])

  const loadSample = useCallback(
    (slug: string) => {
      const sample = sampleBySlug(slug)
      if (!sample) return
      setActiveSlug(slug)
      rebuild(sample.doc)
    },
    [rebuild]
  )

  const patchSun = useCallback(
    (patch: Partial<SceneDocument["environment"]["sun"]>) => {
      setDoc((prev) => {
        const next: SceneDocument = {
          ...prev,
          environment: {
            ...prev.environment,
            sun: { ...prev.environment.sun, ...patch },
          },
        }
        setBuilt(buildThreertScene(next))
        setJsonText(serializeSceneDocument(next))
        setParseErrors([])
        return next
      })
    },
    []
  )

  const patchPreview = useCallback(
    (patch: Partial<SceneDocument["preview"]>) => {
      setDoc((prev) => {
        const next: SceneDocument = {
          ...prev,
          preview: { ...prev.preview, ...patch },
        }
        setJsonText(serializeSceneDocument(next))
        setParseErrors([])
        return next
      })
    },
    []
  )

  return {
    doc,
    built,
    jsonText,
    setJsonText,
    parseErrors,
    applyJson,
    loadSample,
    activeSlug,
    patchSun,
    patchPreview,
    samples: SAMPLE_SCENES,
  }
}