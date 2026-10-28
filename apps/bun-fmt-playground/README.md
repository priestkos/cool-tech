# Bun fmt Playground

One-screen demo of [`bun fmt`](https://bun.com/docs/format) from [Bun v1.4.4](https://bun.com/blog/bun-v1.4.4) (2026-10-22): paste or pick JS, TS, CSS, or JSON, toggle Prettier-compatible flags, and run the real CLI locally via a small `Bun.serve` API.

Buzz: [@bunjavascript on X](https://x.com/bunjavascript/status/2113213103660032209).

## Requirements

- **Bun >= 1.4.4** (this demo targets **1.4.4** exactly for the formatter release).

Install Bun 1.4.4:

```bash
curl -fsSL https://bun.sh/install | bash -s "bun-v1.4.4"
bun --version   # should print 1.4.4
```

## Run

```bash
cd apps/bun-fmt-playground
bun install
bun run dev
```

Open the Vite URL (default `http://localhost:5173`). The dev script starts **both** the API on `127.0.0.1:3944` and Vite with a proxy for `/api`.

## Options → flags

| UI toggle | `bun fmt` flag |
|-----------|----------------|
| Semicolons **off** | `--no-semi` |
| Single quotes **on** | `--single-quote` |
| Print width 40–160 | `--print-width=<n>` |

The server always passes `--no-config` and `--no-editorconfig` so repo or home Prettier / EditorConfig files never affect results. Optional allowlist keys on the API (not exposed in the UI yet): `tabWidth` (2 or 4), `trailingComma` (`all` \| `es5` \| `none`).

## Safety limits

- Fixed argv only: `process.execPath` + `["fmt", "--no-config", "--no-editorconfig", …allowlisted flags, tempFile]` — no shell, no user paths.
- Code written to a fresh directory under the OS temp dir as `input.<ext>` (extension from a fixed language map).
- Max code size **100 KB** (413 above that).
- **5 s** timeout per format; **one format at a time** (429 if busy).
- API binds to **127.0.0.1** only.
- stderr in responses capped at **4 KB**.

## Benchmark note (from release notes only)

The Bun v1.4.4 blog cites ~**59.7 ms** to format Prettier’s own repository with `bun fmt` vs ~**17.1 s** with Prettier — quoted as release-note numbers, not re-measured in this app.

## Pinned versions (publish dates)

| Package | Version | Published (UTC) |
|---------|---------|-----------------|
| bun | 1.4.4 | 2026-10-22 |
| create-vite | 9.3.1 | 2026-10-20 |
| vite | 8.3.5 | 2026-10-21 |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05 |
| react / react-dom | 19.3.1 | 2026-10-14 |
| tailwindcss / @tailwindcss/vite | 4.3.3 | 2026-07-16 |
| shadcn (CLI) | 4.22.1 | 2026-10-18 |
| @types/bun | 1.4.4 | 2026-10-23 |
| concurrently | 9.2.5 | 2026-10-08 |
| diff | 9.0.0 | 2026-04-13 |
| typescript (dev) | 5.8.3 | (bundled with toolchain pin) |

Install policy: `bunfig.toml` sets `[install] minimumReleaseAge = 259200` (72 hours).

## Tests

```bash
bun test
```

Covers the flag allowlist and one `/api/format` round trip with `--no-semi`.

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | API + Vite |
| `bun run build` | Production client build |
| `bun test` | Unit + API smoke tests |
