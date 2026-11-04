# Vendoring Looseleaf (pinned registry install)

**Pin:** `3343cadb65f9d948818276198272388c99b9f380`  
**Commit time (author):** 2026-11-01 05:54:51 -0800 — *Calmer front page, clean tabs, solid charts, American spelling, working installs*  
**Why this SHA:** At demo start (2026-11-04T14:08Z) it was the newest Looseleaf commit at least 72 hours old (not older than `3343cad`). Tip commit `4bdb647` was still inside the 72h window.

## Steps

1. Clone upstream outside this repo: `git clone https://github.com/kevintngo/looseleaf.git /tmp/looseleaf`
2. `git -C /tmp/looseleaf checkout 3343cadb65f9d948818276198272388c99b9f380`
3. Copy `public/r/` to a scratch tree served at `http://localhost:8787/r/{name}.json`, rewriting registry dependency URLs from `https://kevintngo.github.io/looseleaf/r/` to the local server.
4. Temporarily point `components.json` at `@looseleaf`: `http://localhost:8787/r/{name}.json` with aliases under `@/looseleaf/…` and CSS file `src/looseleaf.css`.
5. Install items (shadcn **4.22.1**):

   `@looseleaf/button @looseleaf/tabs @looseleaf/switch @looseleaf/slider @looseleaf/card @looseleaf/dialog @looseleaf/form @looseleaf/input @looseleaf/label @looseleaf/textarea @looseleaf/badge @looseleaf/sonner`

   plus `@looseleaf/looseleaf-theme` for CSS.

6. Copy `src/lib/utils.ts` → `src/looseleaf/lib/utils.ts` (shadcn does not create it).
7. Copy `LICENSE` → `THIRD_PARTY_LICENSES/looseleaf-LICENSE.txt`, fonts → `public/fonts/`, fix `kevin-sans.css` URLs to `/fonts/…`.
8. Restore plain `components.json` (no localhost registry).
9. **Manual edit (documented):** `src/looseleaf/lib/ink/react/defs.tsx` — set `KEVIN_SANS_CSS` to `/fonts/kevin-sans.css` so production bundles never embed the GitHub Pages host.

Run `./scripts/vendor-looseleaf.sh` to repeat (requires `/tmp/looseleaf` and Python for the local registry server).
