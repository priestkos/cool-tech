import { useState } from "react"
import boopSource from "@/components/sounds/boop.ts?raw"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { playSound } from "@/components/sounds/react-bits-sound"
import boop from "@/components/sounds/boop"

export function SoundsAsCode() {
  const [playing, setPlaying] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sounds as code</CardTitle>
        <CardDescription>
          Sound Lab installs synthesis recipes into your repo via{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            bunx shadcn@latest add @react-bits/SoundBoop-TS
          </code>
          . No WAV or MP3 assets — just TypeScript the engine renders at runtime.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          disabled={playing}
          onClick={() => {
            setPlaying(true)
            playSound(boop)
              .catch(() => undefined)
              .finally(() => setPlaying(false))
          }}
        >
          Play boop recipe
        </Button>
        <pre className="max-h-[420px] overflow-auto rounded-lg border bg-muted/40 p-4 text-[11px] leading-relaxed">
          <code>{boopSource}</code>
        </pre>
      </CardContent>
    </Card>
  )
}
