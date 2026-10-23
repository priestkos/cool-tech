import {
  CAMERA_MOTIONS,
  DEFAULT_SHAPE,
  type CameraMotion,
  type SettingsInput,
  type ShapeId,
  type ThemeMode,
} from 'topographic'
import {
  findLocation,
  type LocationId,
} from 'topographic/locations'

const STORAGE_KEY = 'terrain-studio:v2'

/** Curated built-in places shown in the studio (ids from topographic 0.6). */
export const REAL_PLACE_PRESETS: ReadonlyArray<{
  label: string
  location: LocationId
}> = [
  { label: 'Mount Fuji', location: 'fuji' },
  { label: 'Grand Canyon', location: 'grand-canyon' },
  { label: 'Swiss Alps', location: 'matterhorn' },
  { label: 'Himalayas', location: 'everest' },
]

export interface StudioState {
  shape: ShapeId
  /** Built-in real place, or null for procedural terrain from `shape`. */
  location: LocationId | null
  seed: number
  mode: '2d' | '3d'
  elevation: number
  detail: number
  lines: {
    count: number
    width: number
    opacity: number
    indexEvery: number
  }
  terrain: {
    peaks: number
    spread: number
    roughness: number
    sharpness: number
    terracing: number
    variant: number
  }
  motion: {
    speed: number
    warp: number
    sparkle: number
  }
  layout: {
    anchor: number
    fade: number
  }
  theme: {
    mode: ThemeMode
    ink: string
    paper: string
  }
  camera: {
    motion: CameraMotion
    elevation: number
    radius: number
  }
  panelOpen: boolean
}

export const DEFAULT_STUDIO_STATE: StudioState = {
  shape: DEFAULT_SHAPE,
  location: null,
  seed: 21,
  mode: '3d',
  elevation: 0.45,
  detail: 0.55,
  lines: { count: 30, width: 0.26, opacity: 0.4, indexEvery: 5 },
  terrain: {
    peaks: 2,
    spread: 0.5,
    roughness: 0.1,
    sharpness: 0.55,
    terracing: 0.2,
    variant: 0.5,
  },
  motion: { speed: 0.8, warp: 0.47, sparkle: 0.5 },
  layout: { anchor: 1, fade: 0.15 },
  theme: { mode: 'dark', ink: '#cfd8ea', paper: '#0b0b0d' },
  camera: { motion: 'orbit', elevation: 42, radius: 2.2 },
  panelOpen: true,
}

export function studioToTopographicInput(
  state: StudioState,
): Omit<SettingsInput, 'look'> {
  return {
    shape: state.shape,
    location: state.location,
    seed: state.seed,
    mode: state.mode,
    elevation: state.elevation,
    detail: state.detail,
    lines: state.lines,
    terrain: state.terrain,
    motion: state.motion,
    layout: state.layout,
    theme: state.theme,
    camera: state.camera,
  }
}

/** Applies library defaults for a built-in location (camera, lines, elevation, …). */
export function patchForRealPlace(location: LocationId): Partial<StudioState> {
  const info = findLocation(location)
  const defaults = info?.defaults
  const patch: Partial<StudioState> = {
    location,
    mode: '3d',
  }
  if (!defaults) return patch

  patch.elevation = defaults.elevation
  patch.lines = {
    ...DEFAULT_STUDIO_STATE.lines,
    ...defaults.lines,
  }
  patch.layout = {
    ...DEFAULT_STUDIO_STATE.layout,
    ...defaults.layout,
  }
  patch.camera = {
    ...DEFAULT_STUDIO_STATE.camera,
    elevation: defaults.camera.elevation,
    radius: defaults.camera.radius,
  }
  return patch
}

export function loadStudioState(): StudioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return migrateLegacyStorage()
    const parsed = JSON.parse(raw) as Partial<StudioState> & {
      styleName?: string
    }
    const shape =
      parsed.shape ??
      (parsed.styleName as ShapeId | undefined) ??
      DEFAULT_STUDIO_STATE.shape
    return {
      ...DEFAULT_STUDIO_STATE,
      ...parsed,
      shape,
      location: parsed.location ?? null,
      lines: { ...DEFAULT_STUDIO_STATE.lines, ...parsed.lines },
      terrain: { ...DEFAULT_STUDIO_STATE.terrain, ...parsed.terrain },
      motion: { ...DEFAULT_STUDIO_STATE.motion, ...parsed.motion },
      layout: { ...DEFAULT_STUDIO_STATE.layout, ...parsed.layout },
      theme: { ...DEFAULT_STUDIO_STATE.theme, ...parsed.theme },
      camera: { ...DEFAULT_STUDIO_STATE.camera, ...parsed.camera },
    }
  } catch {
    return DEFAULT_STUDIO_STATE
  }
}

function migrateLegacyStorage(): StudioState {
  try {
    const legacy = localStorage.getItem('terrain-studio:v1')
    if (!legacy) return DEFAULT_STUDIO_STATE
    const parsed = JSON.parse(legacy) as Partial<StudioState> & {
      styleName?: string
    }
    const shape =
      (parsed.styleName as ShapeId | undefined) ??
      parsed.shape ??
      DEFAULT_STUDIO_STATE.shape
    return {
      ...DEFAULT_STUDIO_STATE,
      ...parsed,
      shape,
      location: null,
      lines: { ...DEFAULT_STUDIO_STATE.lines, ...parsed.lines },
      terrain: { ...DEFAULT_STUDIO_STATE.terrain, ...parsed.terrain },
      motion: { ...DEFAULT_STUDIO_STATE.motion, ...parsed.motion },
      layout: { ...DEFAULT_STUDIO_STATE.layout, ...parsed.layout },
      theme: { ...DEFAULT_STUDIO_STATE.theme, ...parsed.theme },
      camera: { ...DEFAULT_STUDIO_STATE.camera, ...parsed.camera },
    }
  } catch {
    return DEFAULT_STUDIO_STATE
  }
}

export function saveStudioState(state: StudioState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export const CAMERA_MOTION_OPTIONS = CAMERA_MOTIONS
