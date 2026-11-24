import path from "node:path"

export const APP_ROOT = path.resolve(import.meta.dir, "..")
export const VENDOR_ROOT = path.join(
  APP_ROOT,
  "vendor/danielwh2-sprite-stacking/6fecdfd0d6e5a0595f979550e05f4b1fcde550fe",
)
export const SLICER_PY = path.join(VENDOR_ROOT, "skills/sprite-stacking/scripts/views_to_slices.py")
export const GALLERY_JSON = path.join(APP_ROOT, "public/gallery/manifest.json")
export const GALLERY_DIR = path.join(APP_ROOT, "public/gallery")
export const VENV_PYTHON = path.join(APP_ROOT, ".venv/bin/python")