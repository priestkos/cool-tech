# Wallet Playground

Unofficial community demo. Not affiliated with, or endorsed by, Chánh Đại (ncdai) or chanhdai.com. Uses the MIT-licensed `@ncdai/wallet` shadcn registry component (leather wallet with peek and pull-out cards, Motion).

## Run

```bash
cd apps/leather-wallet-playground
bun install
bun run dev
```

Other scripts: `bun run build`, `bun test`, `bun run lint`.

## Links

| | |
|---|---|
| Source buzz | https://x.com/iamncdai/status/2117279668240044542 |
| Component repo | https://github.com/ncdai/chanhdai.com |
| Docs | https://chanhdai.com/components/wallet |
| Registry item | https://chanhdai.com/r/wallet.json |

## Pinned wallet source

| Field | Value |
|---|---|
| Commit | `ac36e649d58095dd7e4769541f60962da3dcd718` |
| Commit time (IST) | 2026-11-02 20:45:09 IST |
| Merge to main (IST) | 2026-11-02 20:53:16 IST (`2ed6ef17588c00a49b674333b78fd6387f8bc418`) |

This is the **only** commit touching the wallet files in the upstream repo at build time (Nov 5 2026), and it satisfies the ≥72h pin rule. The live registry always tracks `main`; this demo vendors `src/components/wallet.tsx` from the commit above (see `scripts/vendor-wallet.md`).

SHA-256 of vendored `wallet.tsx`: `4e996428daacfaa7ce5331511c80bc42c969f086a7aad2f8729221f8dd818d94` (unchanged from upstream).

## Real knobs vs built-in behaviour

**You can configure (wired to URL state, max 8 cards):**

- Card count, order, per-card colour (`className` on `WalletCard`), title, description, content text
- Pocket label (`WalletLabel`)
- Wallet width (inline `style.width` on `Wallet`; component uses `@container` scaling)

**Built into the vendored component (not props — do not fork for this demo):**

| Constant | Value |
|---|---|
| `PEEK_REVEAL` | 4 spacing steps |
| `PULL_REVEAL` | 52 |
| `CARD_REVEAL` | 9 between stacked cards |
| Intro | `useInView` once at 50% visible; delay 0.12s, stagger 0.08s |
| Pull spring | visualDuration 0.4, bounce 0.25 |
| Settle spring | visualDuration 0.25, bounce 0 |
| Dismiss | Escape or pointer down outside active card |
| Reduced motion | `useReducedMotion()` — no peek, instant motion; test via OS setting or DevTools “Emulate prefers-reduced-motion” (no in-app toggle) |

Use **Replay intro** to remount the wallet (`key`) and replay the entrance animation.

## Surface token

The pocket uses `fill-surface`. This app defines `--surface` / `--surface-foreground` (light and `.dark`) and maps `--color-surface` in `@theme inline`, matching chanhdai.com `globals.css` at the pin. shadcn **mira** does not include these by default.

## Vendoring steps

Documented in `scripts/vendor-wallet.md` (manual copy from pinned commit; live `npx shadcn add @ncdai/wallet` is unpinned).

## Trademark

Upstream `TRADEMARK.md` (see component repo) excludes the names `chanhdai`, `ncdai`, and `chanhdai.com`, the wordmark, and author avatars from the MIT license grant for use *as your product identity*. This demo title is **Wallet Playground**; we do not use excluded marks as branding.

Third-party MIT license text: `THIRD_PARTY_LICENSES/chanhdai-com-LICENSE.txt`.

## Dependency pins (npm publish dates, UTC)

Verified ≥72h before install on 2026-11-05.

| Package | Version | Published (UTC) |
|---|---|---|
| motion | 13.4.0 | 2026-09-16 |
| @base-ui/react | 1.9.0 | 2026-10-09 |
| cn | 0.5.0 | 2026-10-16 |
| react / react-dom | 19.3.1 | 2026-10-14 |
| @types/react / @types/react-dom | 19.3.0 | 2026-09-09 |
| vite | 8.3.5 | 2026-10-21 |
| @vitejs/plugin-react | 6.1.2 | 2026-10-05 |
| typescript | 6.0.3 | 2026-04-16 |
| tailwindcss / @tailwindcss/vite | 4.3.3 | 2026-07-16 |
| shadcn (CLI) | 4.22.1 | 2026-10-18 |
| oxlint | 1.90.0 | 2026-10-27 |
| lucide-react | 1.61.0 | 2026-10-21 |
| @types/bun | 1.4.4 | 2026-10-23 |
| @types/node | 24.19.2 | 2026-10-09 |
| @fontsource-variable/inter | 5.3.0 | (bundled font; added by shadcn init) |
| next-themes | 0.4.6 | (added by shadcn init) |

Additional shadcn UI dependencies are pinned exactly in `package.json` / `bun.lock` under `bunfig.toml` `minimumReleaseAge = 259200`.

## License table (direct dependencies)

| Package | License |
|---|---|
| @ncdai/wallet (vendored source) | MIT (Chánh Đại, 2026) |
| @base-ui/react | MIT |
| motion | MIT |
| cn | MIT |
| react / react-dom | MIT |
| vite / @vitejs/plugin-react | MIT |
| typescript | Apache-2.0 |
| tailwindcss / @tailwindcss/vite | MIT |
| shadcn | MIT |
| oxlint | MIT |
| lucide-react | ISC |
| sonner | MIT |
| class-variance-authority, clsx, tailwind-merge | MIT |
| @hugeicons/* | MIT |
| tw-animate-css | MIT |
| @fontsource-variable/inter | OFL-1.1 |
| next-themes | MIT |

## Offline / privacy

No backend, analytics, or runtime fetches to chanhdai.com after install. Card copy is fictional (`••••` placeholders only). Header links are ordinary `<a href>` tags (no beaconing).

## Not verified here

- Visual parity with chanhdai.com marketing pages or pass artwork demos
- That a future registry publish will match pin `ac36e64`
