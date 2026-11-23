# Liquid Glass Controls — plan

## Goal

Offline local lab for the real Bilal Gürşen Liquid Glass kit: glass buttons, switch, and range sliders as refracting lenses with live backdrop refraction and tunable optics/spring APIs.

## Single-user MVP

- One local user, no API keys, no runtime network, vendored `src/components/liquid-glass/` at pin `d11b3f62407f8d5ec1573c8591e2047248c52cbf` (no analytics script).
- Control board over photo + animated gradient backdrop; shadcn minimalist chrome for panels only.

**Out of scope:** TanStack Start / Nitro upstream app, post-pin features (`dd8497f…`), live shadcn registry install, merging PR.

## Vertical slices

1. **Vendor kit** — Copy `liquid-glass/` + LICENSE; Bun + Vite scaffold; `three@0.185.1`.
2. **Control board** — `GlassButton`, `GlassActionButton`, `GlassLayer` host, `Switch`, `RangeSlider` on `GlassCard` with `live`.
3. **Tuners** — RangeSliders drive `GlassOptics`, blur, `pressSpeed` / `pressBounce` / `knobBounce`.
4. **Proof** — `bun test`, typecheck, build, browser screenshot + interaction video, tracking JSON, PR.

## Stack

| Piece | Why |
|-------|-----|
| Bun + Vite 8.3.5 | Monorepo demo convention |
| React 19 + TS 6 | Proven cool-tech pins |
| three@0.185.1 | Real Switch/Slider WebGPU-TSL runtime |
| shadcn base-mira | Backdrop pills, tuner shell, credits |

## Testing

- Unit: pin presence, no analytics, tuning maps, module imports.
- `bun run typecheck`, `bun run build`, desktop + mobile browser smoke, PR screenshot + video.

## Deferred

- Post-pin Select/dropdown/glow components, deploy to Cloudflare Pages, NumberFlow/lucide-heavy chrome.