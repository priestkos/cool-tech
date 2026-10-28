import { GaugeIcon, ThermometerIcon } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { FileTree, type FileNode } from '@/components/devl/file-tree'
import { JsonExplorer, type JsonValue } from '@/components/devl/json-explorer'
import { LiquidSlider } from '@/components/devl/liquid-slider'
import { VoiceNote } from '@/components/devl/voice-note'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  agentRunResponse,
  DEVL_MERGE_DATE,
  DEVL_SOURCE_COMMIT,
  fileTreeData,
  jsonFileContents,
} from '@/data/sample-data'

function parseJsonInput(raw: string): { data: JsonValue | null; error: string | null } {
  const trimmed = raw.trim()
  if (!trimmed) return { data: null, error: null }
  try {
    return { data: JSON.parse(trimmed) as JsonValue, error: null }
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : 'Invalid JSON',
    }
  }
}

function App() {
  const [explorerData, setExplorerData] = useState<JsonValue>(agentRunResponse)
  const [pasteText, setPasteText] = useState('')
  const [pasteError, setPasteError] = useState<string | null>(null)
  const [treeData, setTreeData] = useState<FileNode[]>(fileTreeData)
  const [temperature, setTemperature] = useState(0.4)
  const [maxSteps, setMaxSteps] = useState(24)

  const readout = useMemo(
    () => ({
      temperature: temperature.toFixed(2),
      maxSteps: Math.round(maxSteps),
      estTokens: Math.round(maxSteps * (180 + temperature * 120)),
    }),
    [maxSteps, temperature],
  )

  const applyPaste = useCallback(() => {
    const { data, error } = parseJsonInput(pasteText)
    setPasteError(error)
    if (data) setExplorerData(data)
  }, [pasteText])

  const handleTreeOpen = useCallback((node: FileNode) => {
    if (!node.name.endsWith('.json')) return
    const payload = jsonFileContents[node.id]
    if (payload) setExplorerData(payload)
  }, [])

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/40">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Agent dev console
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">devl.dev Components</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Four open-source shadcn-style components from{' '}
                <a
                  className="underline underline-offset-4 hover:text-foreground"
                  href="https://devl.dev"
                  rel="noreferrer"
                  target="_blank"
                >
                  devl.dev
                </a>{' '}
                (
                <a
                  className="underline underline-offset-4 hover:text-foreground"
                  href="https://github.com/sean-brydon/devl.dev"
                  rel="noreferrer"
                  target="_blank"
                >
                  source
                </a>
                ,{' '}
                <a
                  className="underline underline-offset-4 hover:text-foreground"
                  href="https://x.com/SeanBrydon13/status/2114768649336869231"
                  rel="noreferrer"
                  target="_blank"
                >
                  X post
                </a>
                ). Component source pinned to commit{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">{DEVL_SOURCE_COMMIT.slice(0, 7)}</code>{' '}
                ({DEVL_MERGE_DATE}).
              </p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>JSON Explorer</CardTitle>
              <CardDescription>
                Search, fold, and copy paths on a made-up agent run payload. Paste JSON below to
                replace the tree (invalid JSON shows an error).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <JsonExplorer
                data={explorerData}
                defaultExpanded={['run', 'run.steps']}
                rootName="response"
                title="response"
              />
              <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                <label className="text-sm font-medium" htmlFor="json-paste">
                  Paste your own JSON
                </label>
                <Textarea
                  id="json-paste"
                  placeholder='{"hello": "world"}'
                  rows={3}
                  value={pasteText}
                  onChange={(e) => {
                    setPasteText(e.target.value)
                    if (pasteError) setPasteError(null)
                  }}
                />
                {pasteError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {pasteError}
                  </p>
                ) : null}
                <Button size="sm" type="button" variant="secondary" onClick={applyPaste}>
                  Load into explorer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liquid Slider</CardTitle>
              <CardDescription>
                Droplet thumbs with live value bubbles driving a small run readout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <LiquidSlider
                icon={<ThermometerIcon />}
                label="Temperature"
                max={1}
                min={0}
                step={0.05}
                tone="info"
                value={temperature}
                formatValue={(v) => v.toFixed(2)}
                onValueChange={setTemperature}
              />
              <LiquidSlider
                icon={<GaugeIcon />}
                label="Max steps"
                max={48}
                min={4}
                step={1}
                tone="primary"
                value={maxSteps}
                formatValue={(v) => `${Math.round(v)} steps`}
                onValueChange={setMaxSteps}
              />
              <div className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Temperature:</span> {readout.temperature}
                </p>
                <p>
                  <span className="text-muted-foreground">Max steps:</span> {readout.maxSteps}
                </p>
                <p>
                  <span className="text-muted-foreground">Est. tokens:</span> ~{readout.estTokens}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File Tree</CardTitle>
              <CardDescription>
                Keyboard nav, F2 rename, drag to move. Open{' '}
                <code className="text-xs">run-output.json</code> to push data into JSON Explorer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileTree
                branch="cursor/devl-dev-components"
                data={treeData}
                defaultExpanded={['apps', 'devl-app', 'src']}
                defaultSelected="run-output"
                repo="cool-tech"
                onChange={setTreeData}
                onOpen={handleTreeOpen}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Voice Note</CardTitle>
              <CardDescription>
                Simulated playback (no audio file): play/pause, scrub, speed chip, word-by-word
                transcript.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <VoiceNote
                sender={{
                  name: 'Agent Console',
                  initials: 'AC',
                  avatarClassName: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200',
                }}
                sentAt="Just now"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </TooltipProvider>
  )
}

export default App
