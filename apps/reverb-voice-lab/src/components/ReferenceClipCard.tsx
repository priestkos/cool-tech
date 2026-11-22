import { useRef, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LANGUAGE_OPTIONS } from "@/lib/languages"
import { recordMicrophoneClip } from "@/lib/mic-recorder"
import {
  REFERENCE_MAX_SECONDS,
  REFERENCE_MIN_SECONDS,
} from "@/lib/reverb-config"
import type { ReverbLanguage } from "runntime/zoo"

type Props = {
  transcript: string
  onTranscript: (v: string) => void
  language: ReverbLanguage
  onLanguage: (v: ReverbLanguage) => void
  referenceDuration: number | null
  referenceError: string | null
  onFile: (data: ArrayBuffer) => Promise<void>
}

export function ReferenceClipCard({
  transcript,
  onTranscript,
  language,
  onLanguage,
  referenceDuration,
  referenceError,
  onFile,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [recordError, setRecordError] = useState<string | null>(null)

  const startRecord = async () => {
    setRecordError(null)
    setRecording(true)
    setRecordSeconds(0)
    try {
      const data = await recordMicrophoneClip(
        REFERENCE_MAX_SECONDS,
        setRecordSeconds,
      )
      await onFile(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setRecordError(message)
    } finally {
      setRecording(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reference voice</CardTitle>
        <CardDescription>
          Record or upload {REFERENCE_MIN_SECONDS}–{REFERENCE_MAX_SECONDS} s of
          one speaker, then type what they said.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="border-amber-500/40 bg-amber-500/10">
          <AlertTitle className="text-sm">Voice cloning ethics</AlertTitle>
          <AlertDescription className="text-sm">
            Only clone voices you own or have permission to use.
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void startRecord()}
            disabled={recording}
          >
            {recording
              ? `Recording… ${recordSeconds.toFixed(1)} s`
              : "Record clip"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            disabled={recording}
          >
            Upload audio
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              void file.arrayBuffer().then((data) => onFile(data))
              e.target.value = ""
            }}
          />
          {referenceDuration !== null ? (
            <Badge variant="secondary">
              Reference: {referenceDuration.toFixed(1)} s
            </Badge>
          ) : null}
        </div>

        {(referenceError ?? recordError) && (
          <p className="text-sm text-destructive" role="alert">
            {referenceError ?? recordError}
          </p>
        )}

        <div className="space-y-2">
          <Label htmlFor="ref-lang">Clip language</Label>
          <Select
            value={language}
            onValueChange={(v) => onLanguage(v as ReverbLanguage)}
          >
            <SelectTrigger id="ref-lang" className="w-full sm:w-64">
              <SelectValue placeholder="Language" />
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
          <Label htmlFor="transcript">Reference transcript</Label>
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => onTranscript(e.target.value)}
            rows={3}
            placeholder="Word-for-word text spoken in the clip"
          />
        </div>
      </CardContent>
    </Card>
  )
}