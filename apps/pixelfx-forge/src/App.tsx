import { useCallback, useEffect, useMemo, useState } from "react";
import { categories } from "pixelfx/fx/index";
import { Download, Pause, Play, RotateCcw, Space } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { EffectBrowser } from "@/components/EffectBrowser";
import { StageViewport, useStageRestart } from "@/components/StageViewport";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  getEffectById,
  loadCatalog,
  searchCatalog,
  type CatalogEffect,
} from "@/lib/catalog";
import {
  buildPaletteOption,
  defaultSwatches,
  PALETTE_PRESETS,
  type PalettePresetId,
} from "@/lib/palette";
import { renderSpriteSheet } from "@/lib/render-export";
import {
  DEFAULT_URL_STATE,
  mergeUrlState,
  parseHash,
  serializeHash,
  type BackgroundMode,
  type ForgeUrlState,
} from "@/lib/url-state";

function groupedEffects(filtered: CatalogEffect[], activeCategory: string) {
  const byCat = new Map<string, CatalogEffect[]>();
  for (const fx of filtered) {
    const list = byCat.get(fx.categoryId) ?? [];
    list.push(fx);
    byCat.set(fx.categoryId, list);
  }
  const order = categories.map((c) => c.id);
  const sections = order
    .filter((id) => (activeCategory === "all" ? true : id === activeCategory))
    .map((id) => {
      const cat = categories.find((c) => c.id === id);
      return { id, name: cat?.name ?? id, items: byCat.get(id) ?? [] };
    })
    .filter((s) => s.items.length > 0);
  return sections;
}

export default function App() {
  const [catalog, setCatalog] = useState<CatalogEffect[]>([]);
  const [state, setState] = useState<ForgeUrlState>(() =>
    mergeUrlState(parseHash(window.location.hash)),
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [playing, setPlaying] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [exportPreview, setExportPreview] = useState<string | null>(null);
  const { restartToken, bumpRestart } = useStageRestart();

  useEffect(() => {
    void loadCatalog().then(setCatalog);
  }, []);

  useEffect(() => {
    const onHash = () => setState(mergeUrlState(parseHash(window.location.hash)));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const next = serializeHash(state);
    if (window.location.hash !== next) window.location.hash = next;
  }, [state]);

  const selected = useMemo(
    () => getEffectById(catalog, state.id) ?? getEffectById(catalog, DEFAULT_URL_STATE.id),
    [catalog, state.id],
  );

  const filtered = useMemo(
    () => searchCatalog(catalog, query, category === "all" ? null : category),
    [catalog, query, category],
  );

  const grouped = useMemo(
    () => groupedEffects(filtered, category),
    [filtered, category],
  );

  const palette = useMemo(
    () =>
      buildPaletteOption(
        selected?.mod.meta.options?.palette as string[] | undefined,
        state.preset,
        state.swatches,
      ),
    [selected, state.preset, state.swatches],
  );

  const fxOptions = useMemo(
    () => ({
      seed: state.seed,
      flip: state.flip,
      ...(palette ? { palette } : {}),
    }),
    [palette, state.flip, state.seed],
  );

  const useArena = Boolean(selected?.hasAct);
  const duration = selected?.mod.meta.duration ?? 1;

  const patchState = useCallback((partial: Partial<ForgeUrlState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const onSelectEffect = (id: string) => {
    const fx = getEffectById(catalog, id);
    const sw = defaultSwatches(fx?.mod.meta.options?.palette as string[] | undefined);
    patchState({
      id,
      preset: "default",
      swatches: sw,
      scrub: 0,
      seed: (fx?.mod.meta.options?.seed as number) ?? state.seed,
    });
    bumpRestart();
    setPlaying(true);
    setIsScrubbing(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && useArena) {
        e.preventDefault();
        bumpRestart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bumpRestart, useArena]);

  const onExport = async () => {
    if (!selected) return;
    const { canvas, json, baseName } = renderSpriteSheet(
      selected.mod,
      selected.id,
      fxOptions,
    );
    const pngUrl = canvas.toDataURL("image/png");
    setExportPreview(pngUrl);
    const pngBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (pngBlob) {
      const pngLink = document.createElement("a");
      pngLink.href = URL.createObjectURL(pngBlob);
      pngLink.download = `${baseName}.png`;
      pngLink.click();
      URL.revokeObjectURL(pngLink.href);
    }
    const jsonBlob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const jsonLink = document.createElement("a");
    jsonLink.href = URL.createObjectURL(jsonBlob);
    jsonLink.download = `${baseName}.json`;
    jsonLink.click();
    URL.revokeObjectURL(jsonLink.href);
  };

  const swatchList =
    state.swatches.length > 0
      ? state.swatches
      : defaultSwatches(selected?.mod.meta.options?.palette as string[] | undefined);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <AppHeader />
        <main className="mx-auto grid max-w-[1400px] gap-6 px-4 py-6 lg:grid-cols-[1fr_420px]">
          <section className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <Input
                  placeholder="Search name, tags, description…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search effects"
                />
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pb-2">
                    <Button
                      size="sm"
                      variant={category === "all" ? "default" : "outline"}
                      onClick={() => setCategory("all")}
                    >
                      All
                    </Button>
                    {categories.map((c) => (
                      <Button
                        key={c.id}
                        size="sm"
                        variant={category === c.id ? "default" : "outline"}
                        onClick={() => setCategory(c.id)}
                      >
                        {c.name}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              <Badge variant="outline">{filtered.length} shown</Badge>
            </div>
            <EffectBrowser
              grouped={grouped}
              selectedId={state.id}
              onSelect={onSelectEffect}
            />
          </section>

          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selected?.name ?? "Loading…"}</CardTitle>
                <p className="text-sm text-muted-foreground">{selected?.desc}</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Body-fitted effects (frost, poison, scan lines) use pixelfx&apos;s stock dummy
                  character.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="flex justify-center"
                  onClick={() => useArena && bumpRestart()}
                  onKeyDown={() => {}}
                  role="presentation"
                >
                  {selected ? (
                    <StageViewport
                      mod={selected.mod}
                      options={fxOptions}
                      playing={playing && !isScrubbing}
                      loop={state.loop}
                      speed={state.speed}
                      scale={state.scale}
                      scrubTime={state.scrub}
                      isScrubbing={isScrubbing}
                      bg={state.bg}
                      useArena={useArena}
                      showBody={state.showBody}
                      showTarget={state.showTarget}
                      onTimeChange={(t) => patchState({ scrub: t })}
                      restartToken={restartToken}
                    />
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPlaying((p) => !p)}
                  >
                    {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
                    {playing ? "Pause" : "Play"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => bumpRestart()}>
                    <RotateCcw className="size-4" />
                    Replay
                  </Button>
                  {useArena ? (
                    <Badge variant="secondary" className="gap-1">
                      <Space className="size-3" />
                      Space / click target
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label>Scrub ({state.scrub.toFixed(2)}s / {duration.toFixed(2)}s)</Label>
                  <Slider
                    min={0}
                    max={duration}
                    step={0.01}
                    value={[Math.min(state.scrub, duration)]}
                    onValueChange={(value) => {
                      const v = Array.isArray(value) ? value[0] : value;
                      setIsScrubbing(true);
                      setPlaying(false);
                      patchState({ scrub: v });
                    }}
                    onPointerUp={() => setIsScrubbing(false)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Speed {state.speed}x</Label>
                    <Slider
                      min={0.25}
                      max={2}
                      step={0.25}
                      value={[state.speed]}
                      onValueChange={(value) => {
                        const v = Array.isArray(value) ? value[0] : value;
                        patchState({ speed: v });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Scale {state.scale}x</Label>
                    <Slider
                      min={1}
                      max={6}
                      step={1}
                      value={[state.scale]}
                      onValueChange={(value) => {
                        const v = Array.isArray(value) ? value[0] : value;
                        patchState({ scale: v });
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Toggle
                    pressed={state.loop}
                    onPressedChange={(v) => patchState({ loop: v })}
                    aria-label="Loop"
                  >
                    Loop
                  </Toggle>
                  <Toggle
                    pressed={state.flip}
                    onPressedChange={(v) => patchState({ flip: v })}
                    aria-label="Flip"
                  >
                    Flip
                  </Toggle>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="seed">Seed</Label>
                    <Input
                      id="seed"
                      type="number"
                      value={state.seed}
                      onChange={(e) =>
                        patchState({ seed: Number(e.target.value) || 1 })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Background</Label>
                    <Select
                      value={state.bg}
                      onValueChange={(v) => patchState({ bg: v as BackgroundMode })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checker">Transparent checker</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="ground">Ground</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Palette</Label>
                  <Select
                    value={state.preset}
                    onValueChange={(v) =>
                      patchState({ preset: v as PalettePresetId, swatches: swatchList })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PALETTE_PRESETS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p === "default" ? "Effect default" : p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-4 gap-2">
                    {swatchList.map((sw, i) => (
                      <div key={`${sw}-${i}`} className="space-y-1">
                        <input
                          type="color"
                          value={sw.slice(0, 7)}
                          onChange={(e) => {
                            const next = [...swatchList];
                            next[i] = e.target.value;
                            patchState({ preset: "default", swatches: next });
                          }}
                          className="h-9 w-full cursor-pointer rounded border bg-transparent"
                          aria-label={`Palette swatch ${i + 1}`}
                        />
                        <Input
                          value={sw}
                          onChange={(e) => {
                            const next = [...swatchList];
                            next[i] = e.target.value;
                            patchState({ preset: "default", swatches: next });
                          }}
                          className="h-8 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {useArena ? (
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={state.showBody}
                        onCheckedChange={(v) => patchState({ showBody: v === true })}
                      />
                      Show body
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={state.showTarget}
                        onCheckedChange={(v) => patchState({ showTarget: v === true })}
                      />
                      Show target
                    </label>
                  </div>
                ) : null}

                <Button className="w-full" onClick={() => void onExport()}>
                  <Download className="size-4" />
                  Export PNG sprite sheet + JSON
                </Button>
                {exportPreview ? (
                  <div className="space-y-2">
                    <Label>Last export preview</Label>
                    <img
                      src={exportPreview}
                      alt="Exported sprite sheet preview"
                      className="max-h-40 rounded border"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <footer className="text-xs text-muted-foreground">
              MIT — Copyright (c) 2026 Patch; Copyright (c) 2026 Hugo Duprez. NOTICE also credits
              Sprite Fusion / Hugo Duprez and Hollow Crown (rehan-remade, MIT).
            </footer>
          </aside>
        </main>
      </div>
    </TooltipProvider>
  );
}
