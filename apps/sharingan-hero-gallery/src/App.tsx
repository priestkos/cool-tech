import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ContentEditor } from "@/components/ContentEditor";
import { HeroPreview } from "@/components/HeroPreview";
import { PropTweaker } from "@/components/PropTweaker";
import { generateHeroJsx } from "@/lib/generate-jsx";
import { heroes, getHero, type HeroDefinition } from "@/lib/heroes";
import { schemaToControls } from "@/lib/schema-controls";
import { hasWebGpu } from "@/lib/sharingan/webgpu/device";
import { cn } from "@/lib/utils";

type GpuUiState = "live" | "fallback" | "dom";

export default function App() {
  const [selectedId, setSelectedId] = useState(heroes[0].id);
  const hero = getHero(selectedId);
  const [drafts, setDrafts] = useState<Record<string, { content: Record<string, unknown>; config: Record<string, unknown> }>>(
    () =>
      Object.fromEntries(
        heroes.map((h) => [h.id, { content: structuredClone(h.defaultContent), config: structuredClone(h.defaultConfig) }]),
      ),
  );
  const [forceFallback, setForceFallback] = useState(false);
  const [gpuUiState, setGpuUiState] = useState<GpuUiState>("dom");

  const draft = drafts[selectedId];
  const controls = useMemo(() => schemaToControls(hero.configSchema), [hero]);

  const resetHero = (target: HeroDefinition) => {
    setDrafts((prev) => ({
      ...prev,
      [target.id]: {
        content: structuredClone(target.defaultContent),
        config: structuredClone(target.defaultConfig),
      },
    }));
  };

  const updateConfig = (nextConfig: Record<string, unknown>) => {
    const parsed = hero.configSchema.safeParse(nextConfig);
    if (!parsed.success) return;
    setDrafts((prev) => ({ ...prev, [selectedId]: { ...prev[selectedId], config: parsed.data as Record<string, unknown> } }));
  };

  const updateContent = (nextContent: Record<string, unknown>) => {
    const parsed = hero.contentSchema.safeParse(nextContent);
    if (!parsed.success) return;
    setDrafts((prev) => ({ ...prev, [selectedId]: { ...prev[selectedId], content: parsed.data as Record<string, unknown> } }));
  };

  const copyJsx = async () => {
    const jsx = generateHeroJsx(hero.componentName, draft.config, draft.content);
    await navigator.clipboard.writeText(jsx);
    toast.success("Copied JSX to clipboard");
  };

  const webGpuBrowser = hasWebGpu();
  const statusLabel = getStatusLabel(hero, gpuUiState, forceFallback, webGpuBrowser);

  return (
    <div className="bg-background text-foreground min-h-svh">
      <header className="border-border border-b px-6 py-4">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Sharingan Hero Gallery</h1>
            <p className="text-muted-foreground text-sm">
              Five registry heroes from{" "}
              <a className="underline" href="https://github.com/rasengan-dev/sharingan" target="_blank" rel="noreferrer">
                rasengan-dev/sharingan
              </a>{" "}
              @ 567bc1ab
            </p>
          </div>
          <Badge variant={statusLabel.variant}>{statusLabel.text}</Badge>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1400px] gap-4 p-4 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Heroes</CardTitle>
            <CardDescription>Installed via local registry + shadcn@4.22.1</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[min(70vh,640px)]">
              <div className="space-y-1 p-2">
                {heroes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      "hover:bg-muted/60 w-full rounded-lg border px-3 py-3 text-left transition",
                      selectedId === item.id ? "border-primary bg-muted/40" : "border-transparent",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      <Badge variant={item.engine === "webgpu" ? "default" : "secondary"}>{item.engine.toUpperCase()}</Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{item.summary}</p>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-medium">{hero.title}</h2>
              <p className="text-muted-foreground text-sm">{hero.summary}</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="force-fallback" checked={forceFallback} onCheckedChange={setForceFallback} disabled={hero.engine !== "webgpu"} />
              <Label htmlFor="force-fallback">Force fallback</Label>
            </div>
          </div>
          <HeroPreview
            hero={hero}
            content={draft.content}
            config={draft.config}
            forceFallback={forceFallback}
            onGpuStateChange={setGpuUiState}
          />
          <p className="text-muted-foreground text-xs">{statusLabel.detail}</p>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Tweaks</CardTitle>
            <CardDescription>Schema-driven config + headline editor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ContentEditor content={draft.content} onChange={updateContent} />
            <Separator />
            <PropTweaker controls={controls} config={draft.config} onChange={updateConfig} />
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => resetHero(hero)}>
                Reset to defaults
              </Button>
              <Button onClick={copyJsx}>Copy JSX</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function getStatusLabel(
  hero: HeroDefinition,
  gpuUiState: GpuUiState,
  forceFallback: boolean,
  webGpuBrowser: boolean,
): { text: string; detail: string; variant: "default" | "secondary" | "destructive" } {
  if (hero.engine === "dom") {
    return {
      text: "DOM hero — live animation",
      detail: "DOM heroes do not use WebGPU.",
      variant: "secondary",
    };
  }
  if (forceFallback) {
    return {
      text: "WebGPU unavailable — showing CSS fallback",
      detail: "Force fallback is on; preview uses the hero's CSS gradient layer only.",
      variant: "destructive",
    };
  }
  if (!webGpuBrowser) {
    return {
      text: "WebGPU unavailable — showing CSS fallback",
      detail: "This browser does not expose navigator.gpu, so WebGPU heroes use their CSS fallback.",
      variant: "destructive",
    };
  }
  if (gpuUiState === "live") {
    return {
      text: "WebGPU: live",
      detail: "The selected WebGPU hero reports data-state=live.",
      variant: "default",
    };
  }
  return {
    text: "WebGPU unavailable — showing CSS fallback",
    detail: "WebGPU is exposed but the hero fell back (adapter missing or runtime error).",
    variant: "destructive",
  };
}
