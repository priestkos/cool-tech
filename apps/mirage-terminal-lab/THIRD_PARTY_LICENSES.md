# Third-party licenses

## Mirage (Apache-2.0)

This demo uses:

- `@struktoai/mirage-browser@0.1.0`
- `@struktoai/mirage-core@0.1.0`

Copyright 2026 Strukto.AI. Licensed under the Apache License, Version 2.0.  
Full license text: `node_modules/@struktoai/mirage-core/LICENSE`

## Mirage core bundled notices

`@struktoai/mirage-core` ships a large `THIRD_PARTY_NOTICES` file (WASM modules, jq-derived code, optional CLI adapters, and Rust crate attributions).  
See: `node_modules/@struktoai/mirage-core/THIRD_PARTY_NOTICES`

This app does not vendor or copy that file into `public/`; it is referenced from `node_modules` only.

## Other runtime dependencies

UI stack packages (React, Vite, Tailwind, shadcn, Playwright for smoke tests) are declared as exact versions in `package.json` and resolved in `bun.lock`.