# SignuDoc Seal Lab — plan

## Goal

Offline, single-user lab that reuses SignuDoc’s MIT audit-chain and PDF-coordinate logic to place fields, collect one- or two-signer signatures via a mock outbox, export a sealed PDF with an audit certificate page, tamper-demo the hash chain, and verify exports locally.

## Single-user MVP

**In:** bundled/upload PDF, field palette, mock signing links, drawn/typed signatures, SHA-256 audit chain, tamper control, local verify registry, legal disclaimer UI.

**Out:** Postgres, email, auth, PAdES/`@signpdf` sealing, remote verify API, qualified signatures.

## Vertical slices

1. Load PDF → place fields → single signer export.
2. Two signers in order → outbox links → certificate page on completion.
3. Tamper audit row → chain break at sequence; Verify drop → match/modified/unknown.

## Stack

Bun + Vite 8 + React 19 + shadcn minimal chrome; `pdfjs-dist` viewer; `pdf-lib` export; WebCrypto SHA-256; adapted SignuDoc modules under `src/signudoc/`.

## Testing

`bun test` for coords, chain, store, verify, PDF export; browser smoke desktop/mobile with screen recording.

## Deferred

Real PAdES seal path, Part 11 re-auth, field types beyond MVP set, Cloudflare deploy preview.