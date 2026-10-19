# Sonic UI Kit

Demo app showcasing [React Bits Sound Lab](https://reactbits.dev/tools) — installable UI sounds as TypeScript recipes, wired into a shadcn component playground.

## Run locally

```bash
cd apps/sonic-ui-kit
bun install
bun run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Sound Lab install

Sounds are added with the React Bits shadcn registry (same pattern as components):

```bash
bunx shadcn@latest add @react-bits/SoundPebble-TS
```

The shared engine installs automatically as a registry dependency:

```bash
bunx shadcn@latest add @react-bits/SoundEngine-TS
```

## Scripts

- `bun run dev` — development server
- `bun run build` — production build
- `bun run test` — unit tests (settings persistence)
- `bun run preview` — preview production build

## Features

- Gallery of shadcn Button, Switch, Tabs, Dialog, and toast — each with a per-component sound picker
- Global mute and volume (persisted in `localStorage`)
- Reduced-motion defaults with override
- Notification center with success / error / info toasts
- “Sounds as code” view with live recipe source
