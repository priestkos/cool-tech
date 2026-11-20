# SignuDoc Seal Lab

Offline demo built on [SignuDoc](https://github.com/NYLLON-SOFTWARE/SignuDoc) (MIT, Nyllon Software) at commit [`23add9893ac0a9747f3aeba5d112d89581c8abea`](https://github.com/NYLLON-SOFTWARE/SignuDoc/tree/23add9893ac0a9747f3aeba5d112d89581c8abea). Launch context: [Kevin Rose on X](https://x.com/kevinrose/status/2122394902168473975).

**Lab signatures are not legally binding.** This app does not produce a qualified or PAdES/legally valid electronic signature.

## Commands

```bash
cd apps/signudoc-seal-lab
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

## Architecture

- **`src/signudoc/`** — MIT-adapted modules (`canonical-json`, hash-chained `audit-chain`, `pdf-coords`) from the pinned SignuDoc tree.
- **`src/lib/`** — in-memory envelope store, local verify registry, `pdf-lib` export with audit certificate page.
- **`src/features/`** — PDF.js viewer overlay, signature pad, lab hook.

Production SignuDoc is a Next.js app with Postgres, email, and PAdES sealing via `pdf-seal.ts` and `@signpdf/*`. Run that project per [SignuDoc’s repository](https://github.com/NYLLON-SOFTWARE/SignuDoc) for the full stack.

This lab intentionally omits PAdES and uses a readable certificate page plus SHA-256 fingerprints instead.

## License

This demo is independent and not official SignuDoc software. SignuDoc’s MIT notice is in `THIRD_PARTY_LICENSES`.