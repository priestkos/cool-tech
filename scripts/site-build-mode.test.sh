#!/usr/bin/env bash
# Regression lock for how scripts/build-site.sh chooses Vite --base.
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=site-build-mode.sh
source "$here/site-build-mode.sh"

check() {
  local name="$1"
  local input="$2"
  local expected="$3"
  local actual
  actual="$(site_build_mode "$input")"
  if [ "$actual" != "$expected" ]; then
    printf '%s\n' "$name" >&2
    exit 1
  fi
}

check "tsc -b && vite build" "tsc -b && vite build" passthrough
check "tsc -b && vite build && node scripts/measure-bundles.mjs" "tsc -b && vite build && node scripts/measure-bundles.mjs" direct
check "empty string" "" direct
check "vite build" "vite build" direct
check "tsc -b && vite build " "tsc -b && vite build " direct

printf '%s\n' "site-build-mode: ok"
exit 0
