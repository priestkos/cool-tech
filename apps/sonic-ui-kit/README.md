# Sonic UI Kit

Demo app for [React Bits Sound Lab](https://reactbits.dev/tools): shadcn/ui components wired to installable sound recipes (TypeScript, not audio files).

## Run locally

```bash
cd apps/sonic-ui-kit
bun install
bun run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Sound Lab install

Sounds are added with the React Bits shadcn registry, for example:

```bash
bunx shadcn@latest add @react-bits/SoundEngine-TS
bunx shadcn@latest add @react-bits/SoundBoop-TS
```

Playback uses `playSound` / `useSound` from the generated `react-bits-sound` engine.

## Scripts

- `bun run dev` — development server
- `bun run build` — production build
- `bun run test` — unit tests (settings persistence)
- `bun run preview` — preview production build
