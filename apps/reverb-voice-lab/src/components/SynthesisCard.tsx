import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { WaveformPlayer } from "@/components/WaveformPlayer"
import { LANGUAGE_OPTIONS } from "@/lib/languages"
import type { GenerationRecord } from "@/lib/generation-types"
import type { LoadPhase } from "@/hooks/useReverbLab"
import type { ReverbLanguage } from "runntime/zoo"

type Props = {
  text: string
  onText: (v: string) => void
  language: ReverbLanguage
  onLanguage: (v: ReverbLanguage) => void
  loadPhase: LoadPhase
  loadProgress: number
  loadLabel: string
  loadError: string | null
  generating: boolean
  generateError: string | null
  output: GenerationRecord | null
  onPreload: () => void
  onGenerate: () => void
  webgpuOk: boolean
}

export function SynthesisCard({
  text,
  onText,
  language,
  onLanguage,
  loadPhase,
  loadProgress,
  loadLabel,
  loadError,
  generating,
  generateError,
  output,
  onPreload,
  onGenerate,
  webgpuOk,
}: Props) {
  const busy =
    generating ||
    loadPhase === "init" ||
    loadPhase === "voice" ||
    loadPhase === "tts"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Synthesize</CardTitle>
        <CardDescription>
          Runs Reverb on your GPU via runntime{" "}
          <code className="text-xs">createTextToSpeech()</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target-lang">Speak in</Label>
          <Select
            value={language}
            onValueChange={(v) => onLanguage(v as ReverbLanguage)}
          >
            <SelectTrigger id="target-lang" className="w-full sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.code} value={opt.code}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target-text">Text to speak</Label>
          <Textarea
            id="target-text"
            value={text}
            onChange={(e) => onText(e.target.value)}
            rows={4}
          />
        </div>

        {loadPhase !== "idle" && loadPhase !== "error" ? (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{loadLabel}</span>
              <span>{loadProgress}%</span>
            </div>
            <Progress value={loadProgress} />
          </div>
        ) : null}

        {loadError ? (
          <p className="text-sm text-destructive" role="alert">
            {loadError}
          </p>
        ) : null}
        {generateError ? (
          <p className="text-sm text-destructive" role="alert">
            {generateError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={!webgpuOk || busy}
            onClick={() => void onPreload()}
          >
            Download &amp; warm models
          </Button>
          <Button
            type="button"
            disabled={!webgpuOk || busy || !text.trim()}
            onClick={() => void onGenerate()}
          >
            {generating ? "Generating…" : "Generate speech"}
          </Button>
        </div>

        {output ? (
          <div className="space-y-2 rounded-md border border-border p-3">
            <p className="text-sm text-muted-foreground">
              Real-time factor:{" "}
              <strong className="text-foreground">{output.rtf.toFixed(2)}</strong>{" "}
              ({output.generationMs.toFixed(0)} ms for{" "}
              {output.audioSeconds.toFixed(2)} s audio)
            </p>
            <WaveformPlayer
              samples={output.samples}
              sampleRate={output.sampleRate}
              label="reverb-output"
            />
          </div>
        ) : (
          <Alert>
            <AlertTitle>No output yet</AlertTitle>
            <AlertDescription>
              Generate speech to see waveform, RTF, and download.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}