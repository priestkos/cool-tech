import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { runAgentSequence } from "@/features/agent-run"
import type {
  SandSignatureEl,
  SandSliderEl,
  SandThinkingEl,
  SandToggleEl,
  ThinkingState,
  TrayWidthPreset,
} from "@/zen-sand/types"
import { TRAY_WIDTH_PX } from "@/zen-sand/types"

const THINKING_STATES: ThinkingState[] = [
  "thinking",
  "searching",
  "tool",
  "writing",
  "idle",
]

const INK = "#1f2a44"
const ZEN_PIN = "8e9b289523e6fdcb19e8be9db5b7ea6a9ccc6c7b"

export function SandGardenLab() {
  const sliderRef = useRef<SandSliderEl>(null)
  const toggleRef = useRef<SandToggleEl>(null)
  const signatureRef = useRef<SandSignatureEl>(null)
  const thinkingRef = useRef<SandThinkingEl>(null)

  const [sliderValue, setSliderValue] = useState(40)
  const [toggleOn, setToggleOn] = useState(false)
  const [signatureEmpty, setSignatureEmpty] = useState(true)
  const [exportPreview, setExportPreview] = useState<string | null>(null)
  const [trayPreset, setTrayPreset] = useState<TrayWidthPreset>("compact")
  const [soundOn, setSoundOn] = useState(true)
  const [thinkingState, setThinkingState] = useState<ThinkingState>("idle")
  const [stepLog, setStepLog] = useState("Ready")
  const [agentRunning, setAgentRunning] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const trayWidth = TRAY_WIDTH_PX[trayPreset]

  const applyTrayWidth = useCallback((width: number) => {
    for (const ref of [sliderRef, toggleRef, signatureRef, thinkingRef]) {
      if (ref.current) ref.current.style.width = `${width}px`
    }
  }, [])

  useEffect(() => {
    applyTrayWidth(trayWidth)
  }, [trayWidth, applyTrayWidth])

  useEffect(() => {
    const sound = window.ZenSand?.Sound
    if (sound) sound.on = soundOn
  }, [soundOn])

  useEffect(() => {
    const el = sliderRef.current
    if (!el) return
    el.value = 40
    const onInput = () => setSliderValue(el.value)
    const onChange = () => setSliderValue(el.value)
    el.addEventListener("input", onInput)
    el.addEventListener("change", onChange)
    setSliderValue(el.value)
    return () => {
      el.removeEventListener("input", onInput)
      el.removeEventListener("change", onChange)
    }
  }, [])

  useEffect(() => {
    const el = toggleRef.current
    if (!el) return
    const onChange = () => setToggleOn(el.checked)
    el.addEventListener("change", onChange)
    setToggleOn(el.checked)
    return () => el.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    const el = signatureRef.current
    if (!el) return
    const syncEmpty = () => setSignatureEmpty(el.empty)
    el.addEventListener("input", syncEmpty)
    syncEmpty()
    return () => el.removeEventListener("input", syncEmpty)
  }, [])

  useEffect(() => {
    const el = thinkingRef.current
    if (!el) return
    const logFor = (state: ThinkingState) => {
      switch (state) {
        case "thinking":
          return "Thinking…"
        case "searching":
          return "Searching…"
        case "tool":
          return "Using a tool…"
        case "writing":
          return "Writing…"
        case "idle":
          return "Ready"
        default: {
          const _exhaustive: never = state
          return _exhaustive
        }
      }
    }
    const onAny = () => {
      const state = el.state
      setThinkingState(state)
      if (!agentRunning) setStepLog(logFor(state))
    }
    el.addEventListener("input", onAny)
    el.addEventListener("change", onAny)
    onAny()
    return () => {
      el.removeEventListener("input", onAny)
      el.removeEventListener("change", onAny)
    }
  }, [agentRunning])

  const setThinking = (state: ThinkingState) => {
    const el = thinkingRef.current
    if (!el) return
    el.state = state
    setThinkingState(state)
  }

  const handleUndo = () => signatureRef.current?.undo()
  const handleClear = () => {
    signatureRef.current?.clear()
    setSignatureEmpty(true)
    setExportPreview(null)
  }

  const handleExport = () => {
    const el = signatureRef.current
    if (!el || el.empty) return
    const url = el.toDataURL(INK, 2)
    setExportPreview(url)
  }

  const handleDownload = () => {
    if (!exportPreview) return
    const a = document.createElement("a")
    a.href = exportPreview
    a.download = "zen-sand-signature.png"
    a.click()
  }

  const handleRunAgent = async () => {
    const el = thinkingRef.current
    if (!el || agentRunning) return
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setAgentRunning(true)
    try {
      await runAgentSequence(
        {
          onStep: (step) => {
            el.state = step.state
            setThinkingState(step.state)
            setStepLog(step.log)
          },
        },
        controller.signal,
      )
    } catch {
      /* aborted */
    } finally {
      setAgentRunning(false)
      abortRef.current = null
    }
  }

  const handleStopAgent = () => {
    abortRef.current?.abort()
    setAgentRunning(false)
    setThinking("idle")
    setStepLog("Ready")
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="border-b border-border/60">
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Tray size sets sand resolution (one simulated cell per CSS pixel). Sound
            uses the official <code className="text-[0.65rem]">ZenSand.Sound.on</code>{" "}
            API — no time-scale knob exists on the pin.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <SettingRow
            label="Tray size / sand resolution"
            htmlFor="tray-size"
          >
            <div className="flex flex-wrap gap-2" id="tray-size">
              <Button
                type="button"
                size="sm"
                variant={trayPreset === "compact" ? "default" : "outline"}
                onClick={() => setTrayPreset("compact")}
              >
                Compact ({TRAY_WIDTH_PX.compact}px)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={trayPreset === "roomy" ? "default" : "outline"}
                onClick={() => setTrayPreset("roomy")}
              >
                Roomy ({TRAY_WIDTH_PX.roomy}px)
              </Button>
            </div>
          </SettingRow>
          <SettingRow label="Sand sound" htmlFor="sound-toggle">
            <div className="flex items-center gap-2">
              <Switch
                id="sound-toggle"
                checked={soundOn}
                onCheckedChange={(v) => setSoundOn(v ?? false)}
              />
              <span className="text-muted-foreground text-xs">
                {soundOn ? "On (after first gesture)" : "Muted via ZenSand.Sound.on"}
              </span>
            </div>
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/60">
          <CardTitle>Rake slider</CardTitle>
          <CardDescription>
            Bamboo rake in sand — arrow keys, Page Up/Down, Home and End on the real
            element.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:gap-6">
          {/* min/max/step are attribute-only on the pin (getter-only props); defaults are 0/100/1 */}
          <sand-slider ref={sliderRef} label="Volume" />
          <div className="text-sm tabular-nums">
            <span className="text-muted-foreground text-xs">Value </span>
            <span className="font-medium">{Math.round(sliderValue)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/60">
          <CardTitle>Stone toggle</CardTitle>
          <CardDescription>
            River stone switch — click, Space, or Enter.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:gap-6">
          <sand-toggle ref={toggleRef} label="Focus mode" />
          <Badge variant={toggleOn ? "default" : "outline"}>
            {toggleOn ? "Checked" : "Off"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/60">
          <CardTitle>Signature pad</CardTitle>
          <CardDescription>
            Backspace undoes, Delete clears. Export uses{" "}
            <code className="text-[0.65rem]">toDataURL(&apos;{INK}&apos;, 2)</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <sand-signature ref={signatureRef} name="signature" className="mb-2" />
          <div className="relative z-10 flex flex-wrap gap-2 bg-card pt-1">
            <Button type="button" size="sm" variant="outline" onClick={handleUndo}>
              Undo
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleClear}>
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={signatureEmpty}
              onClick={handleExport}
            >
              Export PNG
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={!exportPreview}
              onClick={handleDownload}
            >
              Download
            </Button>
          </div>
          {exportPreview ? (
            <SettingRow label="Ink preview">
              <img
                src={exportPreview}
                alt="Exported signature ink on transparent background"
                className="max-w-[200px] rounded-md border border-border bg-[repeating-conic-gradient(oklch(0.92_0.01_85)_0%_25%,oklch(0.96_0.008_90)_0%_50%)] bg-size-[12px_12px] p-2"
              />
            </SettingRow>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Agent thinking tray</CardTitle>
              <CardDescription>
                Fake run cycles real states (~3.5s each). Manual overrides below.
              </CardDescription>
            </div>
            <Badge variant="outline">state: {thinkingState}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-4">
          <sand-thinking ref={thinkingRef} state="idle" />
          <p
            className="text-muted-foreground text-xs"
            role="status"
            aria-live="polite"
          >
            Step log: <span className="text-foreground font-medium">{stepLog}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={agentRunning}
              onClick={() => void handleRunAgent()}
            >
              Run agent
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!agentRunning}
              onClick={handleStopAgent}
            >
              Stop
            </Button>
          </div>
          <SettingRow label="Manual state">
            <div className="flex flex-wrap gap-1.5">
              {THINKING_STATES.map((st) => (
                <Button
                  key={st}
                  type="button"
                  size="xs"
                  variant={thinkingState === st ? "default" : "outline"}
                  disabled={agentRunning}
                  onClick={() => setThinking(st)}
                >
                  {st}
                </Button>
              ))}
            </div>
          </SettingRow>
        </CardContent>
      </Card>

      <Card id="about">
        <CardHeader className="border-b border-border/60">
          <CardTitle>About &amp; credits</CardTitle>
          <CardDescription>
            Independent cool-tech demo — not affiliated with Zen Sand UI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4 text-xs leading-relaxed text-muted-foreground">
          <p>
            Controls vendored byte-for-byte from{" "}
            <a
              href="https://github.com/finktheartist/zen-sand-ui"
              className="text-foreground underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              finktheartist/zen-sand-ui
            </a>{" "}
            at commit{" "}
            <a
              href={`https://github.com/finktheartist/zen-sand-ui/tree/${ZEN_PIN}`}
              className="font-mono text-[0.65rem] text-foreground"
              target="_blank"
              rel="noreferrer"
            >
              {ZEN_PIN.slice(0, 7)}
            </a>
            . MIT © 2026 Justin Finkelman. See{" "}
            <code className="text-[0.65rem]">THIRD_PARTY_LICENSES</code>.
          </p>
          <p>
            Gallery:{" "}
            <a
              href="https://zen-sand-ui.vercel.app"
              className="text-foreground underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              zen-sand-ui.vercel.app
            </a>
            . Launch:{" "}
            <a
              href="https://x.com/crtvTeknologist/status/2123815420016681109"
              className="text-foreground underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              @crtvTeknologist
            </a>
            .
          </p>
          <p>
            Sounds: ElevenLabs (upstream). Thinking rock: GPT Image via Higgsfield
            (upstream). WebGL2 required to draw; browsers keep ~16 live canvases (four
            trays is fine). Sand does not stop for{" "}
            <code className="text-[0.65rem]">prefers-reduced-motion</code>. State
            changes take ~2s including sweep.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingRow({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <Label htmlFor={htmlFor} className="shrink-0 sm:min-w-48">
        {label}
      </Label>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}