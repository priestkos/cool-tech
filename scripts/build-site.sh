#!/usr/bin/env bash
# Build every app into one static site tree for Cloudflare Pages.
#
#   scripts/build-site.sh [out-dir]     # default: site-dist/
#   npx wrangler pages deploy site-dist --project-name cool-tech
#
# Each app is built with --base=/apps/<slug>/ so its assets resolve under the
# deployed path. Apps that need a server at runtime are skipped; see
# scripts/make-index.mjs for the list and the reasons shown on the index page.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=site-build-mode.sh
source "$ROOT/scripts/site-build-mode.sh"
OUT="${1:-$ROOT/site-dist}"
LOGS="$OUT/../site-build-logs"
mkdir -p "$OUT/apps" "$LOGS"
: > "$LOGS/status.tsv"

for dir in "$ROOT"/apps/*/; do
  slug=$(basename "$dir")
  log="$LOGS/$slug.log"
  : > "$log"
  echo "=== $slug ===" >> "$log"

  if ! ( cd "$dir" && bun install >> "$log" 2>&1 ); then
    printf '%s\tFAIL\tinstall\n' "$slug" | tee -a "$LOGS/status.tsv"
    continue
  fi

  # Most apps are "tsc -b && vite build", where extra args land on vite. An app
  # whose script ends in another step would take --base on that step instead and
  # silently build with the default base, so build those explicitly.
  build_script=$( cd "$dir" && node -e "process.stdout.write(require('./package.json').scripts?.build ?? '')" 2>/dev/null )
  mode=$(site_build_mode "$build_script")
  if [ "$mode" = "passthrough" ]; then
    ( cd "$dir" && bun run build -- --base="/apps/$slug/" >> "$log" 2>&1 )
    rc=$?
  else
    ( cd "$dir" && bun x tsc -b >> "$log" 2>&1 && bun x vite build --base="/apps/$slug/" >> "$log" 2>&1 )
    rc=$?
    echo "note: '$build_script' has extra steps; built with tsc + vite directly" >> "$log"
  fi
  if [ $rc -ne 0 ]; then
    printf '%s\tFAIL\tbuild\n' "$slug" | tee -a "$LOGS/status.tsv"
    continue
  fi
  if [ ! -f "$dir/dist/index.html" ]; then
    printf '%s\tFAIL\tno-dist\n' "$slug" | tee -a "$LOGS/status.tsv"
    continue
  fi

  rm -rf "$OUT/apps/$slug"
  mkdir -p "$OUT/apps/$slug"
  cp -a "$dir/dist/." "$OUT/apps/$slug/"
  printf '%s\tOK\t-\n' "$slug" | tee -a "$LOGS/status.tsv"
done

node "$ROOT/scripts/make-index.mjs" "$OUT" "$LOGS/status.tsv"

echo
echo "site tree: $OUT"
awk -F'\t' '{c[$2]++} END {for (k in c) print "  " k, c[k]}' "$LOGS/status.tsv"
