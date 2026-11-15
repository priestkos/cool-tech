# ThreeRT Scene Lab

Independent offline lab inspired by [ThreeRT](https://threert.dev) (Meshy): edit a **lab-owned** JSON scene format with physical sun lux, emissive and artificial lights, and preview it with **plain three.js** in the browser. Hardware path tracing is **native macOS/iOS only** in ThreeRT — this demo does not fake it.

## Clean-room notice

- No `@threert/*` npm packages.
- No copied ThreeRT source, official sample scenes, or comparison images.
- After **~2026-11-16 06:05 IST**, swapping to `@threert/scene` may be considered; this build uses schema version `1` defined in this app only.

## Commands

```bash
cd apps/threert-scene-lab
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

## Architecture

| Area | Role |
|------|------|
| `src/features/scene/schema.ts` | Scene Lab JSON v1 validation and parse errors |
| `src/features/scene/physical.ts` | lux / lm / cd / emissive exitance → three.js intensities |
| `src/features/scene/samples.ts` | Five original sample scenes |
| `src/features/scene/preview.ts` | WebGL preview (shadow-mapped lights, tone mapping) |
| `src/features/lab/*` | Editor, gallery, physical readouts, comparison links |

## Credit

- [ThreeRT](https://threert.dev)
- [ThreeRT GitHub](https://github.com/meshy-dev/ThreeRT) (MIT)
- [Launch post](https://x.com/ThreeRT3D/status/2121238880808829385)

MIT-licensed dependencies retain their own notices under `node_modules/`.