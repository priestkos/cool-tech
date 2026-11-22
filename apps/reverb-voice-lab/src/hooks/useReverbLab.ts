import { useCallback, useEffect, useRef, useState } from "react"
import type { ReverbLanguage, TextToSpeech, Voice, VoiceMaker } from "runntime/zoo"
import {
  createOpfsCache,
  createTextToSpeech,
  createVoiceMaker,
  initRunntime,
  isRunntimeError,
} from "runntime/zoo"
import tgpu from "typegpu"
import { pushHistory, type GenerationRecord } from "@/lib/generation-types"
import { REVERB_MODEL_CONFIG, REVERB_SAMPLE_RATE } from "@/lib/reverb-config"
import {
  decodeToReverbRate,
  trimToMaxReference,
  validateReferenceDuration,
} from "@/lib/reference-audio"
import { probeWebGpu, type WebGpuSupport } from "@/lib/webgpu"

export type LoadPhase = "idle" | "init" | "voice" | "tts" | "ready" | "error"

export function useReverbLab() {
  const [webgpu, setWebgpu] = useState<WebGpuSupport | null>(null)
  const [loadPhase, setLoadPhase] = useState<LoadPhase>("idle")
  const [loadProgress, setLoadProgress] = useState(0)
  const [loadLabel, setLoadLabel] = useState("")
  const [loadError, setLoadError] = useState<string | null>(null)

  const [referenceSamples, setReferenceSamples] = useState<Float32Array | null>(
    null,
  )
  const [referenceDuration, setReferenceDuration] = useState<number | null>(null)
  const [referenceError, setReferenceError] = useState<string | null>(null)

  const [transcript, setTranscript] = useState(
    "Hi, this is my voice for the cloning demo.",
  )
  const [language, setLanguage] = useState<ReverbLanguage>("en")
  const [text, setText] = useState(
    "Welcome to Reverb Voice Lab. This speech runs entirely in your browser.",
  )

  const [voice, setVoice] = useState<Voice | null>(null)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [output, setOutput] = useState<GenerationRecord | null>(null)
  const [history, setHistory] = useState<GenerationRecord[]>([])

  const runtimeReady = useRef(false)
  const voiceMakerRef = useRef<VoiceMaker | null>(null)
  const ttsRef = useRef<TextToSpeech | null>(null)

  useEffect(() => {
    void probeWebGpu().then(setWebgpu)
    return () => {
      voiceMakerRef.current?.dispose()
      ttsRef.current?.dispose()
      voiceMakerRef.current = null
      ttsRef.current = null
    }
  }, [])

  const applyReferenceBuffer = useCallback(
    async (data: ArrayBuffer, label: string) => {
      setReferenceError(null)
      try {
        let samples = await decodeToReverbRate(data)
        samples = trimToMaxReference(samples, REVERB_SAMPLE_RATE)
        const check = validateReferenceDuration(samples, REVERB_SAMPLE_RATE)
        if (!check.ok) {
          setReferenceSamples(null)
          setReferenceDuration(null)
          setVoice(null)
          setReferenceError(check.message)
          return
        }
        setReferenceSamples(samples)
        setReferenceDuration(samples.length / REVERB_SAMPLE_RATE)
        setVoice(null)
        setLoadPhase((p) => (p === "ready" ? "voice" : p))
        setLoadLabel(`Reference loaded (${label})`)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        setReferenceError(`Could not decode audio: ${message}`)
      }
    },
    [],
  )

  const ensureRuntime = useCallback(async () => {
    if (runtimeReady.current) return
    if (webgpu && !webgpu.ok) {
      throw new Error(webgpu.reason)
    }
    setLoadError(null)
    setLoadPhase("init")
    setLoadLabel("Initializing WebGPU engine…")
    setLoadProgress(5)
    const root = await tgpu.init({
      device: { optionalFeatures: ["subgroups", "shader-f16"] },
    })
    initRunntime(root)
    runtimeReady.current = true
    setLoadProgress(15)
  }, [webgpu])

  const ensureModels = useCallback(async () => {
    try {
    await ensureRuntime()
    if (!referenceSamples) throw new Error("Add a 3–10 s reference clip first.")
    if (!transcript.trim()) throw new Error("Reference transcript is required.")

    const cache = await createOpfsCache("reverb-voice-lab")
    const onProgress = (name: string, done: number, total: number) => {
      const pct = total > 0 ? Math.round((100 * done) / total) : 0
      setLoadProgress(20 + Math.min(70, Math.round(pct * 0.7)))
      setLoadLabel(`Loading weights: ${name} (${pct}%)`)
    }

    if (!voiceMakerRef.current) {
      setLoadPhase("voice")
      setLoadLabel("Loading voice encoder…")
      voiceMakerRef.current = await createVoiceMaker(REVERB_MODEL_CONFIG, {
        cache: cache ?? undefined,
        onProgress,
      })
    }

    if (!voice) {
      setLoadLabel("Encoding reference voice…")
      const encoded = await voiceMakerRef.current.fromRecording(
        referenceSamples,
        {
          sampleRate: REVERB_SAMPLE_RATE,
          transcript: transcript.trim(),
          language,
        },
      )
      setVoice(encoded)
      setLoadProgress(85)
    }

    if (!ttsRef.current) {
      setLoadPhase("tts")
      setLoadLabel("Loading Reverb TTS…")
      ttsRef.current = await createTextToSpeech(REVERB_MODEL_CONFIG, {
        cache: cache ?? undefined,
        onProgress,
      })
    }

    setLoadPhase("ready")
    setLoadProgress(100)
    setLoadLabel("Models ready")
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setLoadError(message)
      setLoadPhase("error")
      throw err
    }
  }, [ensureRuntime, referenceSamples, transcript, language, voice])

  useEffect(() => {
    setVoice(null)
  }, [transcript, language, referenceSamples])

  const generate = useCallback(async () => {
    setGenerateError(null)
    setGenerating(true)
    try {
      await ensureModels()
      const tts = ttsRef.current
      const currentVoice = voice
      if (!tts || !currentVoice) throw new Error("Models not loaded.")

      const started = performance.now()
      const samples = await tts.synthesize(text.trim(), currentVoice)
      const ended = performance.now()
      const generationMs = ended - started
      const audioSeconds = samples.length / tts.sampleRate
      const rtf = audioSeconds > 0 ? generationMs / 1000 / audioSeconds : 0

      const record: GenerationRecord = {
        id: crypto.randomUUID(),
        text: text.trim(),
        language,
        createdAt: Date.now(),
        sampleRate: tts.sampleRate,
        samples,
        rtf,
        generationMs,
        audioSeconds,
      }
      setOutput(record)
      setHistory((h) => pushHistory(h, record))
    } catch (err) {
      if (isRunntimeError(err)) {
        setGenerateError(`${err.code}: ${err.message}`)
      } else {
        const message = err instanceof Error ? err.message : String(err)
        setGenerateError(message)
      }
    } finally {
      setGenerating(false)
    }
  }, [ensureModels, text, language, voice])

  return {
    webgpu,
    loadPhase,
    loadProgress,
    loadLabel,
    loadError,
    referenceSamples,
    referenceDuration,
    referenceError,
    transcript,
    setTranscript,
    language,
    setLanguage,
    text,
    setText,
    voice,
    generating,
    generateError,
    output,
    history,
    setHistoryItem: (item: GenerationRecord) => setOutput(item),
    applyReferenceBuffer,
    ensureModels,
    generate,
  }
}