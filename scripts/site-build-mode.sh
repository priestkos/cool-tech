#!/usr/bin/env bash
# How scripts/build-site.sh passes Vite --base.
# passthrough: bun run build -- --base=... (extra args land on vite)
# direct: tsc -b && vite build --base=... (a later script step would swallow --base)
site_build_mode() {
  local build_script="$1"
  if [ "$build_script" = "tsc -b && vite build" ]; then
    printf '%s\n' passthrough
  else
    printf '%s\n' direct
  fi
}
