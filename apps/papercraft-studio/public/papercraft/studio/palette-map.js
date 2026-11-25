/** Map vendored palettes.json roles onto the countryside scene colour table (C). */
export function paletteToCountryside(palette) {
  if (!palette || !palette.subject?.length) throw new Error('Invalid palette entry');
  const [s0, s1, s2, s3, s4] = palette.subject;
  const page = palette.page ?? '#f3e6c6';
  const groundLight = palette.ground?.[0] ?? '#cfc4a1';
  const groundDark = palette.ground?.[1] ?? groundLight;
  const accent = palette.accent ?? s1 ?? s0;
  const river = palette.water?.[0] ?? '#46aa9e';
  const riverDeep = palette.water?.[1] ?? '#2e8079';
  const ink = palette.ink ?? '#3a2412';
  return {
    ground: groundLight,
    wash: groundDark,
    washWarm: page,
    path: page,
    river,
    riverDeep,
    foam: page,
    field: s2 ?? s0,
    leafA: s0,
    leafB: s1 ?? s0,
    leafC: s2 ?? s1 ?? s0,
    pine: s3 ?? s2 ?? s0,
    bush: s4 ?? s3 ?? s0,
    bushB: s4 ?? s3 ?? s2 ?? s0,
    hill: groundDark,
    hillB: groundLight,
    trunk: s4 ?? s3 ?? ink,
    wall: page,
    roof: s1 ?? s0,
    roofB: s2 ?? s1,
    roofC: s0,
    window: accent,
    stone: groundDark,
    wood: s4 ?? s3 ?? ink,
    hay: s2 ?? s0,
    ink,
    cloak: s3 ?? '#4f6a8a',
    hat: accent,
    door: riverDeep,
    earth: groundDark,
    turf: groundDark,
    meadow: groundLight,
  };
}

export function paletteToCountryside2d(palette) {
  const c3 = paletteToCountryside(palette);
  const accent = palette.accent ?? c3.leafB;
  return {
    ground: c3.ground,
    wash: c3.wash,
    washWarm: c3.washWarm,
    path: c3.path,
    river: c3.river,
    riverDeep: c3.riverDeep,
    foam: c3.foam,
    leaf: [c3.leafA, c3.leafB, c3.leafC],
    pine: c3.pine,
    bush: [c3.bush, c3.bushB],
    trunk: c3.trunk,
    stone: c3.stone,
    wall: c3.wall,
    roof: [c3.roof, c3.roofB],
    window: accent,
    wood: c3.wood,
    ink: c3.ink,
    hat: c3.hat,
    shadow: palette.leak ?? '#6e3010',
    kraft: palette.ground?.[0] ?? c3.ground,
  };
}

export async function loadPalette(name) {
  // Relative to this module so the path survives being served under /apps/<slug>/.
  const res = await fetch(new URL('../palettes.json', import.meta.url));
  const all = await res.json();
  const entry = all[name];
  if (!entry || !entry.subject) throw new Error(`Unknown palette: ${name}`);
  return entry;
}

export const PALETTE_NAMES = [
  'storybook-autumn',
  'golden-hour',
  'desert-noon',
  'snow-cabin',
  'blossom-spring',
  'misty-forest',
  'jungle',
  'dusk-violet',
  'lantern-night',
  'sea-teal',
  'industrial-tin',
];