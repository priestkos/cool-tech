# Gradient Playground

One-page studio to try every **free** [gradients.sh](https://gradients.sh) component live and copy its shadcn install command.

## Run locally

```bash
cd apps/gradient-playground
bun install
bun run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## What it shows

- Hero backgrounds: mesh, grain, aurora, waves, radial glow, linear flow, section fade
- Live controls for speed, grain, blur, scale, warp, and colours (or CSS theme palette)
- Light/dark toggle so gradients follow shadcn theme variables
- Gallery of gradient text, button, border, and card
- Renderer badge (WebGPU vs WebGL2 fallback)

Components are installed as source via the documented registry URLs, for example:

```bash
npx shadcn@latest add https://gradients.sh/r/mesh-gradient.json
```

## Scripts

- `bun run dev` — development server
- `bun run build` — production build
- `bun test` — install-command helper test
- `bun run lint` — oxlint
