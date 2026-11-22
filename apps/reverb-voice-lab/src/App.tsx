import type { ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { GenerationHistoryPanel } from "@/components/GenerationHistoryPanel"
import { ReferenceClipCard } from "@/components/ReferenceClipCard"
import { SynthesisCard } from "@/components/SynthesisCard"
import { useReverbLab } from "@/hooks/useReverbLab"
import { REVERB_HF_REVISION } from "@/lib/reverb-config"

export function App() {
  const lab = useReverbLab()
  const webgpuOk = lab.webgpu?.ok === true

  return (
    <AppShell>
      <header className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-8 pt-10">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Reverb Voice Lab</h1>
          <Badge variant="outline">runntime 0.3.0</Badge>
          <Badge variant="secondary">HF {REVERB_HF_REVISION.slice(0, 7)}</Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Browser voice cloning with Software Mansion&apos;s Reverb model over
          WebGPU. Weights load from Hugging Face at revision{" "}
          <code className="text-xs">{REVERB_HF_REVISION}</code>.
        </p>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 pb-16 lg:grid-cols-2">
        <div className="space-y-6">
          {lab.webgpu && !lab.webgpu.ok ? (
            <Alert variant="destructive">
              <AlertTitle>WebGPU required</AlertTitle>
              <AlertDescription>{lab.webgpu.reason}</AlertDescription>
            </Alert>
          ) : lab.webgpu?.ok ? (
            <Alert>
              <AlertTitle>WebGPU ready</AlertTitle>
              <AlertDescription className="text-sm">
                {lab.webgpu.adapterName
                  ? `Adapter: ${lab.webgpu.adapterName}. `
                  : null}
                shader-f16: {lab.webgpu.shaderF16 ? "yes" : "no"}.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertTitle>Checking WebGPU…</AlertTitle>
            </Alert>
          )}

          <ReferenceClipCard
            transcript={lab.transcript}
            onTranscript={lab.setTranscript}
            language={lab.language}
            onLanguage={lab.setLanguage}
            referenceDuration={lab.referenceDuration}
            referenceError={lab.referenceError}
            onFile={(data) => lab.applyReferenceBuffer(data, "upload")}
          />
        </div>

        <div className="space-y-6">
          <SynthesisCard
            text={lab.text}
            onText={lab.setText}
            language={lab.language}
            onLanguage={lab.setLanguage}
            loadPhase={lab.loadPhase}
            loadProgress={lab.loadProgress}
            loadLabel={lab.loadLabel}
            loadError={lab.loadError}
            generating={lab.generating}
            generateError={lab.generateError}
            output={lab.output}
            onPreload={() => void lab.ensureModels()}
            onGenerate={() => void lab.generate()}
            webgpuOk={webgpuOk}
          />

          <GenerationHistoryPanel
            history={lab.history}
            activeId={lab.output?.id}
            onSelect={lab.setHistoryItem}
          />

          <footer className="space-y-2 rounded-md border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            <p>
              Weights:{" "}
              <a
                className="text-primary underline"
                href="https://huggingface.co/software-mansion/Reverb-TTS"
                target="_blank"
                rel="noreferrer"
              >
                software-mansion/Reverb-TTS
              </a>{" "}
              (CC BY-NC 4.0, non-commercial). Upstream:{" "}
              <a
                className="text-primary underline"
                href="https://github.com/software-mansion-labs/Reverb-TTS"
                target="_blank"
                rel="noreferrer"
              >
                software-mansion-labs/Reverb-TTS
              </a>{" "}
              (Apache-2.0).
            </p>
            <p>
              Only clone voices you own or have permission to use.
            </p>
          </footer>
        </div>
      </main>
    </AppShell>
  )
}

function AppShell({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh">{children}</div>
}