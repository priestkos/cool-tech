import { useRef, useState } from "react"
import { ThemeProvider, useTheme } from "next-themes"
import { toast } from "sonner"
import {
  Wallet,
  WalletCard,
  WalletCardContent,
  WalletCardDescription,
  WalletCardHeader,
  WalletCards,
  WalletCardTitle,
  WalletLabel,
  WalletPocket,
} from "@/components/wallet"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  COLOR_PRESETS,
  MAX_CARDS,
  MIN_CARDS,
  type PlaygroundCard,
  type PlaygroundConfig,
} from "@/lib/config"
import { generateWalletSnippet } from "@/lib/snippet"
import { DISCLAIMER_AUTHOR, LINKS } from "@/lib/external-links"
import { WALLET_BEHAVIOUR, WALLET_PIN_IST } from "@/lib/wallet-behaviour"
import { useActiveCardIndex } from "@/hooks/use-active-card-index"
import { usePlaygroundConfig } from "@/hooks/use-playground-config"

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="theme" className="text-sm font-medium">
        Dark mode
      </label>
      <Switch
        id="theme"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
      />
    </div>
  )
}

function PlaygroundInner() {
  const { config, setConfig, shareUrl } = usePlaygroundConfig()
  const stageRef = useRef<HTMLDivElement>(null)
  const activeIndex = useActiveCardIndex(stageRef)
  const [introKey, setIntroKey] = useState(0)
  const snippet = generateWalletSnippet(config)

  function updateCard(index: number, patch: Partial<PlaygroundCard>) {
    setConfig((prev) => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === index ? { ...card, ...patch } : card,
      ),
    }))
  }

  function moveCard(index: number, direction: -1 | 1) {
    setConfig((prev) => {
      const next = [...prev.cards]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      const tmp = next[index]
      next[index] = next[target]!
      next[target] = tmp!
      return { ...prev, cards: next }
    })
  }

  function addCard() {
    setConfig((prev) => {
      if (prev.cards.length >= MAX_CARDS) return prev
      const preset = COLOR_PRESETS[prev.cards.length % COLOR_PRESETS.length]!
      return {
        ...prev,
        cards: [
          ...prev.cards,
          {
            title: "New Pass",
            description: "Draft",
            content: "•••• 0000",
            colorClass: preset.className,
          },
        ],
      }
    })
  }

  function removeCard(index: number) {
    setConfig((prev) => {
      if (prev.cards.length <= MIN_CARDS) return prev
      return {
        ...prev,
        cards: prev.cards.filter((_, i) => i !== index),
      }
    })
  }

  async function copySnippet() {
    await navigator.clipboard.writeText(snippet.full)
    toast.success("Snippet copied")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-card/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {DISCLAIMER_AUTHOR}
            </p>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Wallet Playground
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Configure card count, colours, copy, pocket label, and width for
              the{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                @ncdai/wallet
              </code>{" "}
              shadcn registry component, then try peek and pull-out behaviour.
            </p>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              <a
                className="text-primary underline-offset-4 hover:underline"
                href={LINKS.xPost}
                rel="noreferrer"
                target="_blank"
              >
                Source post
              </a>
              <a
                className="text-primary underline-offset-4 hover:underline"
                href={LINKS.componentRepo}
                rel="noreferrer"
                target="_blank"
              >
                Component repo
              </a>
              <a
                className="text-primary underline-offset-4 hover:underline"
                href={LINKS.componentDocs}
                rel="noreferrer"
                target="_blank"
              >
                Docs
              </a>
              <a
                className="text-primary underline-offset-4 hover:underline"
                href={LINKS.registryJson}
                rel="noreferrer"
                target="_blank"
              >
                Registry JSON
              </a>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Stage</CardTitle>
                <CardDescription>
                  Hover to peek, click a title to pull a card out. Pinned wallet{" "}
                  <code className="text-xs">{WALLET_BEHAVIOUR.pin.slice(0, 7)}</code>{" "}
                  ({WALLET_PIN_IST}).
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIntroKey((k) => k + 1)}
                >
                  Replay intro
                </Button>
                <span className="rounded-md border border-border bg-muted/50 px-2 py-1 text-xs tabular-nums">
                  Active card:{" "}
                  {activeIndex === null ? "none" : `#${activeIndex + 1}`}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div
                ref={stageRef}
                className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/20 p-6"
              >
                <WalletPreview config={config} introKey={introKey} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Built-in behaviour</CardTitle>
              <CardDescription>
                Read-only values from the vendored source — not configurable
                props.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <BehaviourRow label="PEEK_REVEAL" value={WALLET_BEHAVIOUR.peekReveal} />
              <BehaviourRow label="PULL_REVEAL" value={WALLET_BEHAVIOUR.pullReveal} />
              <BehaviourRow label="CARD_REVEAL spacing" value={WALLET_BEHAVIOUR.cardReveal} />
              <BehaviourRow
                label="Intro stagger"
                value={`delay ${WALLET_BEHAVIOUR.enterDelay}s, step ${WALLET_BEHAVIOUR.enterStagger}s`}
              />
              <BehaviourRow
                label="Pull spring"
                value={`visualDuration ${WALLET_BEHAVIOUR.pullSpring.visualDuration}, bounce ${WALLET_BEHAVIOUR.pullSpring.bounce}`}
              />
              <BehaviourRow
                label="Settle spring"
                value={`visualDuration ${WALLET_BEHAVIOUR.settleSpring.visualDuration}, bounce ${WALLET_BEHAVIOUR.settleSpring.bounce}`}
              />
              <p className="sm:col-span-2 text-muted-foreground">
                Intro: {WALLET_BEHAVIOUR.introInView}. Dismiss:{" "}
                {WALLET_BEHAVIOUR.dismiss}. Reduced motion:{" "}
                {WALLET_BEHAVIOUR.reducedMotion}
              </p>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wallet settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="pocket-label" className="text-sm font-medium">
                  Pocket label
                </label>
                <Input
                  id="pocket-label"
                  value={config.pocketLabel}
                  onChange={(e) =>
                    setConfig({ ...config, pocketLabel: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <label className="text-sm font-medium">Width ({config.widthPx}px)</label>
                </div>
                <Slider
                  min={280}
                  max={480}
                  step={4}
                  value={[config.widthPx]}
                  onValueChange={(value) => {
                    const next = Array.isArray(value) ? value[0] : value
                    if (typeof next === "number") {
                      setConfig({ ...config, widthPx: next })
                    }
                  }}
                />
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>Shareable URL (reload to restore):</p>
                <Input readOnly value={shareUrl} className="text-xs" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Cards</CardTitle>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={config.cards.length >= MAX_CARDS}
                onClick={addCard}
              >
                Add card
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.cards.map((card, index) => (
                <div
                  key={`${index}-${card.title}`}
                  className="space-y-2 rounded-lg border border-border/70 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      Card {index + 1}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={index === 0}
                        onClick={() => moveCard(index, -1)}
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={index === config.cards.length - 1}
                        onClick={() => moveCard(index, 1)}
                      >
                        ↓
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={config.cards.length <= MIN_CARDS}
                        onClick={() => removeCard(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <ToggleGroup
                    value={[
                      COLOR_PRESETS.find((p) => p.className === card.colorClass)
                        ?.id ?? "sky",
                    ]}
                    onValueChange={(ids) => {
                      const id = ids[0]
                      const preset = COLOR_PRESETS.find((p) => p.id === id)
                      if (preset) updateCard(index, { colorClass: preset.className })
                    }}
                    className="flex flex-wrap justify-start"
                  >
                    {COLOR_PRESETS.map((preset) => (
                      <ToggleGroupItem
                        key={preset.id}
                        value={preset.id}
                        aria-label={preset.label}
                        className="h-8 px-2 text-xs"
                      >
                        {preset.label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <Input
                    placeholder="Title"
                    value={card.title}
                    onChange={(e) => updateCard(index, { title: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={card.description}
                    onChange={(e) =>
                      updateCard(index, { description: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Content"
                    value={card.content}
                    onChange={(e) => updateCard(index, { content: e.target.value })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base">Snippet</CardTitle>
                <CardDescription className="text-xs">
                  Install command targets live HEAD; demo built against pin.
                </CardDescription>
              </div>
              <Button type="button" size="sm" onClick={copySnippet}>
                Copy
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="jsx">
                <TabsList className="w-full">
                  <TabsTrigger value="jsx" className="flex-1">
                    JSX
                  </TabsTrigger>
                  <TabsTrigger value="install" className="flex-1">
                    Install
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="jsx">
                  <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-[11px] leading-relaxed">
                    {snippet.jsx}
                  </pre>
                </TabsContent>
                <TabsContent value="install" className="space-y-2">
                  <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
                    {snippet.install}
                  </pre>
                  <p className="text-xs text-muted-foreground">{snippet.note}</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  )
}

function BehaviourRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-2 rounded-md border border-border/60 px-2 py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-xs">{value}</span>
    </div>
  )
}

function WalletPreview({
  config,
  introKey,
}: {
  config: PlaygroundConfig
  introKey: number
}) {
  return (
    <Wallet
      key={introKey}
      className="max-w-full"
      style={{ width: config.widthPx }}
    >
      <WalletCards>
        {config.cards.map((card, index) => (
          <WalletCard
            key={`${index}-${card.title}`}
            className={card.colorClass}
          >
            <WalletCardHeader>
              <WalletCardTitle>{card.title}</WalletCardTitle>
              <WalletCardDescription>{card.description}</WalletCardDescription>
            </WalletCardHeader>
            <WalletCardContent className="font-mono text-sm">
              {card.content}
            </WalletCardContent>
          </WalletCard>
        ))}
      </WalletCards>
      <WalletPocket>
        <WalletLabel>{config.pocketLabel}</WalletLabel>
      </WalletPocket>
    </Wallet>
  )
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PlaygroundInner />
    </ThemeProvider>
  )
}
