# Glass Logo Reveal

One-page studio to drop in a logo, tune a liquid-glass reveal animation, and copy settings as JSON. Built as a React port of [glass-icon-reveal](https://github.com/zanwei/glass-icon-reveal) (MIT).

Inspired by [@zanwei_guo on X](https://x.com/zanwei_guo/status/2113506406418780663).

## Run locally

```bash
cd apps/glass-logo-reveal
bun install
bun run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Attribution

WebGL 2 shader, spring timeline, and logo-to-SDF pipeline are ported from [zanwei/glass-icon-reveal](https://github.com/zanwei/glass-icon-reveal). See `LICENSE-glass-icon-reveal` for the upstream MIT license text.

## Tests

```bash
bun test
```
