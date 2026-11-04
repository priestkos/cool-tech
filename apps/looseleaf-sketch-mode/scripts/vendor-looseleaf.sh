#!/usr/bin/env bash
# Vendors Looseleaf components from pinned commit 3343cadb65f9d948818276198272388c99b9f380
# (2026-11-01 05:54:51 -0800 — newest commit >=72h old at demo start 2026-11-04T14:08Z).
set -euo pipefail
PIN=3343cadb65f9d948818276198272388c99b9f380
LOOSELEAF_REPO="${LOOSELEAF_REPO:-/tmp/looseleaf}"
REGISTRY_ROOT="${REGISTRY_SCRATCH:-/tmp/looseleaf-registry-root}"
PORT="${REGISTRY_PORT:-8787}"
APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

git -C "$LOOSELEAF_REPO" checkout "$PIN"

rm -rf "$REGISTRY_ROOT"
mkdir -p "$REGISTRY_ROOT/r"
cp -a "$LOOSELEAF_REPO/public/r/." "$REGISTRY_ROOT/r/"
find "$REGISTRY_ROOT/r" -name '*.json' -exec sed -i 's|https://kevintngo.github.io/looseleaf/r/|http://localhost:'"$PORT"'/r/|g' {} +

python3 -m http.server "$PORT" --directory "$REGISTRY_ROOT" &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT
sleep 1

cd "$APP_ROOT"
cp components.json components.json.bak
node - <<'NODE'
const fs = require('fs');
const path = require('path');
const p = path.join(process.cwd(), 'components.json');
const j = JSON.parse(fs.readFileSync(p, 'utf8'));
j.registries = { '@looseleaf': `http://localhost:${process.env.REGISTRY_PORT || 8787}/r/{name}.json` };
j.aliases = {
  components: '@/looseleaf/components',
  utils: '@/looseleaf/lib/utils',
  ui: '@/looseleaf/components/ui',
  lib: '@/looseleaf/lib',
  hooks: '@/looseleaf/hooks',
};
j.tailwind.css = 'src/looseleaf.css';
fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n');
NODE

npx --yes shadcn@4.22.1 add \
  @looseleaf/button @looseleaf/tabs @looseleaf/switch @looseleaf/slider \
  @looseleaf/card @looseleaf/dialog @looseleaf/form @looseleaf/input \
  @looseleaf/label @looseleaf/textarea @looseleaf/badge @looseleaf/sonner \
  --yes --overwrite

mkdir -p src/looseleaf/lib
cp src/lib/utils.ts src/looseleaf/lib/utils.ts

# Move mistaken @/ paths if shadcn wrote them at repo root
if [ -d '@/looseleaf' ]; then
  mkdir -p src/looseleaf
  cp -a '@/looseleaf/'* src/looseleaf/ 2>/dev/null || true
  rm -rf '@'
fi

mv components.json.bak components.json

cp "$LOOSELEAF_REPO/LICENSE" "$APP_ROOT/THIRD_PARTY_LICENSES/looseleaf-LICENSE.txt"
mkdir -p "$APP_ROOT/public/fonts"
cp "$LOOSELEAF_REPO/public/fonts/"* "$APP_ROOT/public/fonts/"
sed -i 's|url("./Kevin|url("/fonts/Kevin|g' "$APP_ROOT/public/fonts/kevin-sans.css"
sed -i 's|https://kevintngo.github.io/looseleaf/fonts/kevin-sans.css|/fonts/kevin-sans.css|g' "$APP_ROOT/src/looseleaf/lib/ink/react/defs.tsx"

echo "Looseleaf vendored from $PIN"
