import { useEffect, useRef, useState } from "react";
import { HeroSection } from "@/lib/sharingan/react";
import type { HeroDefinition } from "@/lib/heroes";

type HeroPreviewProps = {
  hero: HeroDefinition;
  content: Record<string, unknown>;
  config: Record<string, unknown>;
  forceFallback: boolean;
  onGpuStateChange?: (state: "live" | "fallback" | "dom") => void;
};

export function HeroPreview({ hero, content, config, forceFallback, onGpuStateChange }: HeroPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderKey, setRenderKey] = useState(0);

  useEffect(() => {
    setRenderKey((k) => k + 1);
  }, [forceFallback, hero.id]);

  useEffect(() => {
    if (hero.engine === "dom") {
      onGpuStateChange?.("dom");
      return;
    }
    if (forceFallback) {
      onGpuStateChange?.("fallback");
      return;
    }

    const root = containerRef.current;
    if (!root) return;

    const readState = () => {
      const node = root.querySelector("[data-state]");
      const state = node?.getAttribute("data-state") ?? "live";
      onGpuStateChange?.(state === "live" ? "live" : "fallback");
    };

    readState();
    const observer = new MutationObserver(readState);
    observer.observe(root, { subtree: true, attributes: true, attributeFilter: ["data-state"] });
    const timer = window.setInterval(readState, 500);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [hero.engine, forceFallback, onGpuStateChange, renderKey]);

  const previewClass = "min-h-[520px] [&_.sg-hero]:min-h-[520px] [&_.sg-hero]:py-16";

  if (hero.engine === "webgpu" && forceFallback && hero.fallbackStyle) {
    return (
      <div ref={containerRef} className="overflow-hidden rounded-xl border border-border bg-background">
        <HeroSection
          key={`${hero.id}-forced-${renderKey}`}
          className={previewClass}
          content={content as never}
          background={() => (
            <div
              aria-hidden
              className="sg-hero-layer"
              style={hero.fallbackStyle!(config)}
              data-state="unsupported"
              data-sharingan={hero.id}
            />
          )}
        />
      </div>
    );
  }

  const { Component } = hero;
  return (
    <div ref={containerRef} className="overflow-hidden rounded-xl border border-border bg-background">
      <Component key={`${hero.id}-${renderKey}`} content={content} config={config} className={previewClass} />
    </div>
  );
}
