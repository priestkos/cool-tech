# Liquid Glass Controls

Offline lab for the **real** [Liquid Glass](https://github.com/bilalgursen/liquid-glass) UI kit (MIT, Bilal Abdullah Gürşen): glass buttons, switch, and sliders as refracting lenses with spring physics. Vendored from commit [`d11b3f62407f8d5ec1573c8591e2047248c52cbf`](https://github.com/bilalgursen/liquid-glass/tree/d11b3f62407f8d5ec1573c8591e2047248c52cbf) (2026-11-19) — no cookieless analytics script.

**Independent demo** — not official upstream software.

## Commands

```bash
cd apps/liquid-glass-controls
bun install
bun run dev      # Vite dev server
bun test
bun run typecheck
bun run build
bun run preview  # production build preview
```

## Architecture

- **Vite + React 19** shell with shadcn minimalist chrome (backdrop picker, tuner panel, credits).
- **`src/components/liquid-glass/`** — upstream kit verbatim (WebGL2 `engine.ts` + Three/TSL `controls/glass/runtime.ts`).
- **`three@0.185.1`** — required for `Switch`, `RangeSlider`, and `Checkbox` runtime paths.
- **Lab UI** — `GlassCard` (`live`) hosts controls; tuners wire `GlassOptics`, `blur`, and `pressSpeed` / `pressBounce` on real components.

Swap **Photo** vs **Gradient** backdrops to see refraction change; tune refraction, blur, and spring stiffness with the kit’s own `RangeSlider` widgets.

## Run the upstream site

Follow [liquid-glass-interface.pages.dev](https://liquid-glass-interface.pages.dev) and the upstream repo README for the full TanStack Start docs app (not vendored here).

## Credits & license

- Upstream: [github.com/bilalgursen/liquid-glass](https://github.com/bilalgursen/liquid-glass), pin `d11b3f62407f8d5ec1573c8591e2047248c52cbf`, demo [liquid-glass-interface.pages.dev](https://liquid-glass-interface.pages.dev), launch [X post](https://x.com/bilalgursen777/status/2124533364283552065).
- **MIT** — Copyright (c) 2026 Bilal Abdullah Gürşen. Full text in `THIRD_PARTY_LICENSES.liquid-glass` and the in-app **About** panel.

Provenance audit: `dependency-evidence.json`.