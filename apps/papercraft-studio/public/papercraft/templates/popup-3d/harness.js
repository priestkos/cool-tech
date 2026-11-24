// papercraft / templates / popup-3d / harness.js
// The FIXED harness of a pop-up world seen from inside: renderer, camera, paper, the printed-ground sheet, placement of
// pieces on hinges (popup), light and moods, the macro lens, the flat-stack choreography, input, walking over the walk
// field, and the capture hook. Keep it as it is; write your world in your own scene.js against the API below (the
// bundled scene.js is the countryside worked example). URL switches: ?capture (no hint), ?test (your scene's test
// cards), ?mood=golden|dusk|night, ?walk (WASD / arrows; createHarness({ play: true }) makes it the default), ?still
// (no walking: the fixed overview), ?roam (full prints everywhere), ?diag=key (the key alone), ?ss=2 (2x supersampled
// review captures).
// In your own project: copy assets/lib/ (and assets/examples/ only if you import one) and this file, keep it as it is,
// and map "papercraft/" in your page's import map to the folder that holds lib/ (the template's index.html maps it to ../../).
import * as THREE from 'three';
import * as P2 from 'papercraft/lib/paperkit-2d.js';
import { paperTextures, paperMaterial, makeCard, crossCard, WalkField, fitShadow, hinge, paperLights, enableSoftShadows, PaperPost, PAPER_LIGHT } from 'papercraft/lib/paperkit-3d.js';
import { PaperSound } from 'papercraft/lib/paper-sound.js';
import { windSway } from 'papercraft/lib/paper-motion.js';

/** Measured light sets. The prints never change: only light, shadow tint, haze and grade. Night keeps the pieces warm
 *  under an even pale-blue moon (warm windows and lamp pools carry the warmth), navy only far away and in the deep
 *  shadows. */
export const MOODS = {
  golden: { key: '#ffc890', ki: 3.4, dir: [-0.85, 0.52, 0.5], fill: '#b9bcd8', fi: 0.8, sky: '#ffe6c8', skyG: '#8a7a70', si: 0.4, leak: '#8f5034',
    post: { exposure: 0.86, tint: [1.02, 0.99, 0.98], saturation: 1.0, haze: '#e6c08a' } },
  dusk: { key: '#ffb38a', ki: 3.2, dir: [-0.866, 0.45, 0.5], fill: '#6f63a8', fi: 1.3, sky: '#a898d0', skyG: '#5a4a78', si: 1.0, leak: '#6a4a8a', glow: 1.1, lamp: 6,
    post: { exposure: 1.0, tint: [1.02, 0.97, 1.0], saturation: 0.95, haze: '#c98fa0', hazeStart: 24, hazeEnd: 80, hazeAmount: 0.5, vignette: 0.12, vignetteColor: '#1a1430', shadowTint: '#1e2050' } },
  night: { key: '#c8d6ff', ki: 1.6, fill: '#7890d0', fi: 0.7, sky: '#3a56b0', skyG: '#22243a', si: 0.85, leak: '#26368a', wrap: 0.4, glow: 1.4, lamp: 4.5,
    post: { exposure: 0.95, tint: [0.98, 0.98, 1.03], saturation: 1.12, haze: '#0e1a44', hazeStart: 14, hazeEnd: 55, hazeAmount: 0.9, vignette: 0.12, vignetteColor: '#0a0c24', shadowTint: '#141c48', shadowLift: 0.04 } },
};

/**
 * createHarness(options) -> H. Options (all optional): bounds { x0, x1, z0, z1 } of the printed ground sheet in world
 * units (1 unit ~ 1 cm of card; the hero ~3.6), ground (the plain card colour beyond the print), view { pitch, dist,
 * target, fov, follow: [dx, dz] } (follow: where the walking camera looks, relative to the hero, x dist / 66: the
 * default [-9.3, -9] keeps him in the lower right, so lay walks out going up and left), testView { dist, target }
 * (?test), heroHeight, light (paperLights options + leak, softness, maxPenumbra), lens (PaperPost options), walk
 * { step, radius }, moods (light sets by name), play (true: WASD / arrows walk the hero without ?walk; ?still turns
 * it off), focus ([x, y, z]: where the lens focuses until the hero first moves, e.g. a landmark he starts in front of;
 * default the hero), mood ('golden' | 'dusk' | 'night' | a key of moods: the world's own light; ?mood= overrides it).
 * H.onStep(fn): fn(time, dt) every fixed step (fireflies, flicker, a turning wheel): animate on the harness clock.
 * The hero is a page-level popup (no parent). Anywhere he stands, on the page or on a deck, he rides whatever is under
 * him as the world rises, until he first moves. The camera follows him only once he has moved.
 * H: THREE, flags { TEST, MOOD, WALK, ROAM, DIAG }, renderer, scene, camera, paper, view, target, walk (WalkField),
 * hinges, spots (your named places, for captures), printGround(draw), popup(pts, paint, opts), inFrame(x, z),
 * sharpAt(x, z), lamp(x, y, z, k), glowing(group), setHero(handle, { stride, turn }), start(). The hero is a 3D paper
 * model facing +z: walking accelerates at a constant rate, the HEADING turns smoothly toward the way he goes (the whole
 * model yaws: it reads from every side), he leans forward on a springy settle and rolls into turns. stride(walked,
 * gait) is called every frame with the distance walked and the walking amount (0 standing .. 1 striding): swing the
 * limbs there. turn: 'yaw' (default) or 'flip' (a flat card that mirrors to face left / right: critters, extras).
 */
export function createHarness({ bounds = { x0: -64, x1: 64, z0: -62, z1: 38 }, ground = '#cfc4a1', view: view0 = {}, testView = { dist: 38, target: [3, 1.5, -6] },
  heroHeight = 3.6, light = {}, lens = {}, walk: walkOpts = { step: 0.75, radius: 0.6 }, moods = MOODS, play = false, focus = null, mood = null } = {}) {
  const T0 = performance.now();
  const Q = new URLSearchParams(location.search);
  const flags = { TEST: Q.has('test'), MOOD: Q.get('mood') || mood || 'day', WALK: Q.has('walk') || (play && !Q.has('still') && !Q.has('test')), DIAG: Q.get('diag') };
  flags.ROAM = flags.WALK || Q.has('roam');            // the camera can go anywhere: every row prints at full quality
  if (Q.has('capture')) document.getElementById('hint')?.remove();

  // ---- renderer, camera, paper -----------------------------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
  // ?ss=2 supersamples (renders at 2x and lets the browser downsample): review captures at the shipped frames' edge
  // smoothness; the live view on a retina screen gets the same from its pixel ratio
  renderer.setPixelRatio(Math.min(3, Math.min(devicePixelRatio, 2) * Math.max(1, Number(Q.get('ss')) || 1)));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;     // the PCSS patch reads raw depth
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(ground);
  const view = { yaw: 0, pitch: 47, dist: 66, fov: 26, ...view0 };
  view.tyaw = view.yaw; view.tpitch = view.pitch;
  const target = new THREE.Vector3(...(view0.target || [2, 1.5, -6]));
  if (flags.TEST) { view.dist = testView.dist; target.set(...testView.target); }   // close enough to judge edges, fibre, shadows, blur
  const camera = new THREE.PerspectiveCamera(view.fov, 16 / 9, 5, 600);
  const paper = paperTextures(renderer, { color: '#f7f0e2', seed: 4, unitsPerTile: 5, fibres: 1.5, mottle: 0.08, normalStrength: 3 });
  function placeCamera(yawDeg, pitchDeg) {
    const yaw = THREE.MathUtils.degToRad(yawDeg), pit = THREE.MathUtils.degToRad(pitchDeg);
    camera.position.set(target.x + Math.sin(yaw) * Math.cos(pit) * view.dist, target.y + Math.sin(pit) * view.dist, target.z + Math.cos(yaw) * Math.cos(pit) * view.dist);
    camera.lookAt(target);
  }
  placeCamera(view.yaw, view.pitch); camera.updateMatrixWorld();
  const _v = new THREE.Vector3();
  /** Is (x, z) in the frame (with margin m, at height y)? Fill only where the camera can see. */
  const inFrame = (x, z, m = 0.12, y = 1) => { _v.set(x, y, z).project(camera); return Math.abs(_v.x) < 1 + 2 * m && _v.y > -1 - m && _v.y < 1 + m; };
  /** Inside the lens's sharp-to-mid band at the starting view (the far top rows and the big near cards are blurred). */
  const sharpAt = (x, z, y = 1) => { _v.set(x, y, z).project(camera); return _v.y > -0.95 && _v.y < 0.7; };

  // ---- the printed ground: one continuous sheet, far bigger than the frame ----------------------------------------
  /**
   * printGround(draw, { ppu }): draw(t) paints the ground sheet with the tools t = { g (2D context, pixel units), W, H,
   * ppu, X(x), Z(z) (world -> sheet px), rnd, washes(colours) (three scales of watercolour blotches with wet edges),
   * torn(pts, fill, fringe) (a torn-paper region: never an airbrushed band), band(fx, half, z0, z1) (a ribbon along
   * x = fx(z) as a polygon for torn), ribbon(fx, w, colour, z0, z1, wobble), bandOf(pts, half) and line(pts, w, colour)
   * (the same along any polyline, e.g. P2.pathLine(ctrl).pts: across the view too), drifts(fn, { n, inside }) (marks gathered
   * in drifts: fn(px, py) at clustered sheet positions) }. Then the paper is multiplied in and the sheet laid down.
   */
  function printGround(draw, { ppu = 22, seed = 20 } = {}) {
    const G = bounds, W = (G.x1 - G.x0) * ppu, H = (G.z1 - G.z0) * ppu, rnd = P2.rng(seed);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const X = (x) => (x - G.x0) * ppu, Z = (z) => (z - G.z0) * ppu;
    g.fillStyle = ground; g.fillRect(0, 0, W, H);
    const washes = (cols, { scales = [[60, 180, 460, 0.3], [200, 50, 150, 0.2], [700, 10, 34, 0.12]] } = {}) => {
      for (const [n, r0, r1, a] of scales) for (let i = 0; i < n; i++) {
        const x = rnd() * W, y = rnd() * H, r = r0 + rnd() * (r1 - r0), col = cols[Math.floor(rnd() * cols.length)];
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, P2.rgba(col, a * 0.6)); gr.addColorStop(0.78, P2.rgba(col, a)); gr.addColorStop(0.9, P2.rgba(P2.shade(col, -0.15), a * 1.2)); gr.addColorStop(1, P2.rgba(col, 0));
        g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
      }
    };
    const torn = (pts, fill, fringe = 'rgba(255,248,230,0.7)') => {
      const out = [];
      for (let i = 0; i < pts.length; i++) {
        const [x0, z0] = pts[i], [x1, z1] = pts[(i + 1) % pts.length], L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(L / 0.18));
        for (let k = 0; k < n; k++) { const t = k / n, j = (rnd() - 0.5) * 0.12 + Math.sin((x0 + z0 + t * L) * 1.7) * 0.05; out.push([x0 + (x1 - x0) * t + j, z0 + (z1 - z0) * t + j]); }
      }
      g.beginPath(); out.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z)))); g.closePath();
      g.fillStyle = fill; g.fill(); g.strokeStyle = fringe; g.lineWidth = 0.15 * ppu; g.stroke();   // the torn paper's white fibrous edge, ~2-4 px on screen
    };
    const band = (fx, half, z0 = G.z0, z1 = G.z1) => {
      const L = [], R = [];
      for (let z = z0; z <= z1; z += 0.4) { const w = half(z), dx = fx(z + 0.2) - fx(z - 0.2), n = Math.hypot(dx, 0.4); L.push([fx(z) - w * 0.4 / n, z + w * dx / n]); R.push([fx(z) + w * 0.4 / n, z - w * dx / n]); }
      return [...L, ...R.reverse()];
    };
    const ribbon = (fx, w, col, z0 = G.z0, z1 = G.z1, wob = 0) => {
      g.strokeStyle = col; g.lineWidth = w * ppu; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
      for (let z = z0; z <= z1; z += 0.5) (z === z0 ? g.moveTo : g.lineTo).call(g, X(fx(z) + wob * (Math.sin(z * 1.1 + w) * 0.6 + Math.sin(z * 2.7) * 0.4)), Z(z));
      g.stroke();
    };
    // bandOf(pts, half): a polygon around a polyline [[x, z], ...] (e.g. P2.pathLine(ctrl).pts) for torn(): paths and
    // rivers that run in any direction, across the view too; line(pts, w, colour): a stroke along one
    const bandOf = (pts, half) => {
      const Lf = [], Rt = [];
      pts.forEach(([x, z], i) => {
        const [ax, az] = pts[Math.max(0, i - 1)], [bx, bz] = pts[Math.min(pts.length - 1, i + 1)], tx = bx - ax, tz = bz - az, n = Math.hypot(tx, tz) || 1;
        const w = typeof half === 'function' ? half(i / Math.max(1, pts.length - 1)) : half;
        Lf.push([x - tz / n * w, z + tx / n * w]); Rt.push([x + tz / n * w, z - tx / n * w]);
      });
      return [...Lf, ...Rt.reverse()];
    };
    const line = (pts, w, col) => { g.strokeStyle = col; g.lineWidth = w * ppu; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); pts.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z)))); g.stroke(); };
    const drifts = (fn, { n = 9000, inside = 0.5, outside = 0.005, threshold = 0.68 } = {}) => {   // sparse and clustered: an even sprinkle reads as a stamp
      const mask = P2.tileNoise(256, 9, rnd), at = (x, y) => mask[(Math.floor(y / H * 256) & 255) * 256 + (Math.floor(x / W * 256) & 255)];
      for (let k = 0; k < n; k++) { const x = rnd() * W, y = rnd() * H; if (rnd() > (at(x, y) > threshold ? inside : outside)) continue; fn(x, y); }
    };
    draw({ g, W, H, ppu, X, Z, rnd, washes, torn, band, ribbon, bandOf, line, drifts });
    g.globalCompositeOperation = 'multiply'; g.fillStyle = g.createPattern(paper.sheet, 'repeat'); g.fillRect(0, 0, W, H); // the paper shows through
    const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const mat = paperMaterial({ map: tex, normalMap: paper.normalMap.clone(), normalScale: 0.9 });
    mat.normalMap.repeat.set((G.x1 - G.x0) / 5, (G.z1 - G.z0) / 5); mat.normalMap.needsUpdate = true;
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(G.x1 - G.x0, G.z1 - G.z0), mat);
    sheet.rotation.x = -Math.PI / 2; sheet.position.set((G.x0 + G.x1) / 2, 0, (G.z0 + G.z1) / 2); sheet.receiveShadow = true;
    const farMap = paper.map.clone(); farMap.repeat.set(160, 160); farMap.needsUpdate = true; // plain card beyond the print
    const beyond = new THREE.Mesh(new THREE.PlaneGeometry(800, 800), paperMaterial({ color: ground, map: farMap }));
    beyond.rotation.x = -Math.PI / 2; beyond.position.y = -0.02; beyond.receiveShadow = true;
    scene.add(sheet, beyond);
    return sheet;
  }

  // ---- placement: every piece is a printed card (or a construction) on a hinge -------------------------------------
  const hinges = [], walk = new WalkField(walkOpts), spots = {}, lamps = [], glowers = [];
  const Z_NEAR = bounds.z1 - 13;     // the nearest z the fill reaches: the top of the flat stack (order runs from here)
  const lean = P2.rng(7);            // its own stream: an edit in the scene never reshuffles the leans
  let seedN = 1;
  /**
   * popup(pts, paint, opts) puts a printed card (or opts.node: a cross, a box fold, a construction) on a hinge.
   * opts: x, z, yaw, cross (a slotted cross of pts), sway (wind, 0-1), scale, node, height (of a node, for its spring),
   * edge (cut-edge width), holes (outlines cut through the card: a door, windows, gaps), self (a construction that moves
   * its own parts: bridge, stairs), level (no hand-placed lean: walkable boxes), effects (force full prints: 1, flat: 0),
   * solid (footprint radius for the walk field, in card units: it is multiplied by scale; ~0.3-0.45 for a prop),
   * parent (a deck frame to stand on). On a parent, x and z are in the DECK's frame (x across, z toward its front),
   * yaw is relative to the deck (subtract the deck's yaw to face the camera), pass `order` yourself (the default comes
   * from z), give a solid its world position (wx, wz) and its height (base), and the piece always prints in full.
   * order: rise order (default from depth). Returns the hinge handle.
   */
  function popup(pts, paint, { x = 0, z = 0, yaw = 0, cross = false, sway = 0, scale = 1, node = null, height = 0, edge = 0.08, self = false, parent = null, order = null, solid = 0, level = false, wx = x, wz = z, base = 0, effects = null, holes = null } = {}) {
    const box = pts ? P2.bbox(pts) : { h: height };
    // pieces the lens blurs (the far rows, the big near cards) print flat and coarse: the build is ~2x faster and nothing
    // visible changes; a roaming camera (?walk, ?roam) prints everything fully
    const sharp = effects ?? (parent || flags.TEST || flags.ROAM || sharpAt(x, z) ? 1 : 0);
    const opts = { paint, paper, seed: seedN++, thickness: 0.08, edgeWidth: edge / scale, pxPerUnit: (sharp ? 40 : 28) / scale, effects: sharp };
    const card = node || (cross ? crossCard(pts, opts) : makeCard(pts, { ...opts, holes }));
    card.scale.setScalar(scale);
    const size = Math.min(1, (box.h * scale) / 12); // 0 = a tab, 1 = a page-sized flap: bigger cards rise slower
    // cards fold back (away from the camera), so a nearer card lies ON TOP of the flat stack: its fold line sits a hair
    // higher, it rises first and folds down last. rest: nothing stands plumb.
    const h = hinge(card, { at: new THREE.Vector3(x, parent ? 0.01 : 0.02 + (z - bounds.z0) * 0.0006, z), yaw, open: 0, size,
      ...(self ? { flat: 0, rest: 0 } : { rest: level ? 0 : (lean() - 0.5) * 0.07 }) });
    h.order = order ?? (Z_NEAR - z) / 5 + lean() * 0.4; h.swayAmp = sway; h.size = size; h.x = x; h.z = z; h.jit = lean() * 0.035; h.id = hinges.length;
    hinges.push(h); (parent || scene).add(h.group);
    if (solid) walk.solid(wx, wz, solid * scale, { base });
    return h;
  }
  /** Settings for a card you make yourself (layeredCard, a construction) so it prints like popup's own. */
  const cardOpts = (x, z, scale = 1, parent = null) => { const sharp = parent || flags.TEST || flags.ROAM || sharpAt(x, z) ? 1 : 0; return { paper, thickness: 0.08, edgeWidth: 0.08 / scale, pxPerUnit: (sharp ? 40 : 28) / scale, effects: sharp, seed: seedN++ * 31 }; };
  /** A practical light (lamp, lit door, brazier): a warm pool at dusk and night, k = relative power. */
  const lamp = (x, y, z, k = 1, dist = 10) => lamps.push([x, y, z, k, dist]);
  /** A group whose printed panes glow (P.glow): dim by day, lit at dusk and night. */
  const glowing = (group) => { glowers.push(group); group.traverse((o) => o.userData.setGlow?.(0.35)); };

  const H = { THREE, P2, flags, renderer, scene, camera, paper, view, target, walk, hinges, spots, bounds, heroHeight,
    printGround, popup, cardOpts, inFrame, sharpAt, lamp, glowing, hero: null, heroStride: null, stepHooks: [], onStep: (fn) => H.stepHooks.push(fn), heroTurn: 'yaw', setHero: (h, { stride = null, turn = 'yaw' } = {}) => { H.hero = h; H.heroStride = stride; H.heroTurn = turn; }, start };

  // ---- start: light, lens, choreography, input, walking, the loop and the capture hook -------------------------------
  function start() {
    const hero = H.hero; if (!hero) throw new Error('papercraft harness: call H.setHero(popup(...)) before H.start()');
    const L = { target: new THREE.Vector3(-1, 0, -12), keyDir: [-0.8, 0.95, 0.55], key: '#ffdcb2', keyIntensity: 3.0, fill: '#f2dcc2', fillIntensity: 0.8,
      fillDir: [0.45, 0.5, 1.0], sky: '#fff0da', ground: '#b39a78', skyIntensity: 0.42, shadowExtent: 50, distance: 100, mapSize: 4096, leak: '#a0602c', softness: 0.26, maxPenumbra: 1.4, ...light };
    // key from the side, ~55 deg off the camera axis and ~45 deg up: faces stay lit, shadows fall sideways where the
    // camera sees them (a key from behind the camera hides every shadow)
    const lights = paperLights(scene, L);
    PAPER_LIGHT.leak.value.set(L.leak);      // shadows a warm amber by day, more saturated than the ground, never grey
    enableSoftShadows(lights.key, { softness: L.softness, maxPenumbra: L.maxPenumbra });
    const post = new PaperPost(renderer, scene, camera, { haze: '#d8bf8e', hazeStart: 34, hazeEnd: 95, hazeAmount: 0.3, focusBand: 0.3, ramp: 0.3, maxBlur: 18,
      tint: [1.03, 0.985, 0.98], saturation: 0.96, greenDesat: 0.3, exposure: 0.82, contrast: 1.18, vignette: 0.03, ...lens });
    const M = moods[flags.MOOD];
    if (M) {
      lights.key.color.set(M.key); lights.key.intensity = M.ki; lights.fill.color.set(M.fill); lights.fill.intensity = M.fi;
      if (M.dir) lights.key.position.copy(lights.key.target.position).addScaledVector(new THREE.Vector3(...M.dir).normalize(), L.distance);
      lights.sky.color.set(M.sky); lights.sky.groundColor.set(M.skyG); lights.sky.intensity = M.si;
      PAPER_LIGHT.leak.value.set(M.leak); if (M.wrap) PAPER_LIGHT.wrap.value = M.wrap;
      if (M.glow && flags.DIAG !== 'key') for (const gr of glowers) gr.traverse((o) => o.userData.setGlow?.(M.glow));
      if (M.lamp && flags.DIAG !== 'key') for (const [x, y, z, k, d] of lamps) { const P = new THREE.PointLight('#ffb070', M.lamp * k, d, 1.0); P.position.set(x, y, z); scene.add(P); } // before the first render: the light count is fixed
      Object.assign(post.o, M.post); post.apply();
    }
    // ?diag=key: the key light alone (look.md 8b), applied AFTER the mood so it holds in every mood
    if (flags.DIAG === 'key') { lights.fill.intensity = 0; lights.sky.intensity = 0; PAPER_LIGHT.leak.value.set('#000000'); }

    // choreography: the nearest card lies on top of the flat stack, so it rises first; closing is the exact reverse
    const sound = new PaperSound();
    let up = false;
    function setOpen(open) {
      up = open;
      const maxOrder = Math.max(...hinges.map((h) => h.order));
      for (const h of hinges) {
        const k = open ? h.order : maxOrder - h.order;
        h.set(open ? 1 : 0, 0.1 + k * (open ? 0.09 : 0.045) + h.jit);   // fixed per-piece jitter: replays are identical
        h.onStart = (hh) => sound.flap({ size: hh.size, up: open, key: hh.id });  // a number per piece: the engine groups by key
      }
    }
    // camera: looking down into the world (40-55 deg), long lens, gentle drift; drag to look around
    let drag = null;
    renderer.domElement.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, moved: 0 }; sound.unlock(); });
    addEventListener('keydown', () => sound.unlock());     // a player on the keys alone hears it too
    addEventListener('pointermove', (e) => {
      if (!drag) return;
      drag.moved += Math.abs(e.movementX) + Math.abs(e.movementY);
      view.tyaw = THREE.MathUtils.clamp(view.tyaw - e.movementX * 0.15, -12, 12);      // the world is filled where the camera
      view.tpitch = THREE.MathUtils.clamp(view.tpitch + e.movementY * 0.12, 40, 55);  // looks; never so low the far edge shows
    });
    addEventListener('pointerup', () => { if (drag && drag.moved < 6) setOpen(!up); drag = null; });

    // walking (?walk): WASD / arrows move the hero over the walk field; the camera follows and refits the shadow map.
    // Movement as the source game moves its player: velocity approaches the wanted one at a constant rate (a snappy
    // start, a clean stop), the heading turns smoothly toward the way he goes (rotation only, never a scale), a forward
    // lean on an under-damped spring (he rocks once when he stops), a roll into turns
    const KEYS = { KeyW: [0, -1], ArrowUp: [0, -1], KeyS: [0, 1], ArrowDown: [0, 1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };
    const keys = new Set(), heroPos = new THREE.Vector3(), camOff = new THREE.Vector3(), shadowAt = new THREE.Vector3().copy(target);
    const HERO0 = new THREE.Vector3(), TARGET0 = new THREE.Vector3().copy(target), FO = view.follow || [-9.3, -9];
    const SPEED = 1.9 * heroHeight, ACCEL = 28 * heroHeight, TURN = 13, LEAN = 3.5 * Math.PI / 180, LEAN_W = 2 * Math.PI * 3.4, LEAN_Z = 0.75, ROLL = 4 * Math.PI / 180;
    let facing = 1, moved = false;   // moved: the hero has walked (keys or walkPath): the camera follows, the lens too
    let walked = 0, gait = 0;        // the distance walked and how much he is walking (0 standing .. 1 striding)
    let heading = 0, heading0 = 0, yawRate = 0, lean = 0, leanV = 0; const vel = new THREE.Vector3();
    let looking = false;             // a look() review frame holds the camera until restart()
    const DIST0 = view.dist;
    if (flags.WALK) {
      // physical keys (e.code: any layout, caps lock or shift), no modifier chords, all released when the page loses
      // focus (a key let go in another window never sticks)
      addEventListener('keydown', (e) => { if (!KEYS[e.code] || e.metaKey || e.ctrlKey || e.altKey) return; keys.add(e.code); e.preventDefault(); });
      addEventListener('keyup', (e) => keys.delete(e.code));
      addEventListener('blur', () => keys.clear());
      document.addEventListener('visibilitychange', () => { if (document.hidden) keys.clear(); });
    }
    // camera window (as the source game frames its player): a STILL zone round the hero where the camera does not move
    // at all (short moves and stops leave the frame dead still: no glide after the keys are let go), a soft zone where
    // it picks up his speed gradually (0 at the still edge, all of it at the hard edge he can never cross), and after
    // ~0.35-1.1 s of steady walking one way the window slides ahead so he has room in front. The camera chases the
    // window on a critically damped spring (0.28 s) evaluated at the middle of each step, so the path does not depend
    // on the frame rate. Sizes: the source game's, in its units at its distance, scaled with view.dist.
    const ZN = { stillR: 1.0, stillUp: 0.4, stillDown: 0.6, hardR: 2.2, hardUp: 1.1, hardDown: 1.4, leadAfter: [0.35, 1.1], leadTau: 0.7, leadRate: 1.2, smoothTime: 0.28, lookAhead: 1.0, lookAheadSouth: 2.4 };
    const zc = new THREE.Vector3(), zPrev = new THREE.Vector3(), zDir = new THREE.Vector2(), goal = new THREE.Vector3(), prevGoal = new THREE.Vector3(), tVel = new THREE.Vector3();
    let walkT = 0, zoneLive = false;
    const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const frameAt = (cx, cz) => { const kd = view.dist / 66; return goal.set(cx + FO[0] * kd, 1.5 + heroPos.y * 0.5, cz + FO[1] * kd); };
    function zoneStep(dt) {
      const p = heroPos, k = view.dist / 10.8;
      if (!zoneLive) { zc.copy(p); zPrev.copy(p); zDir.set(0, 0); walkT = 0; zoneLive = true; }
      const yaw = THREE.MathUtils.degToRad(view.yaw), ux = -Math.sin(yaw), uz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
      let oR = (p.x - zc.x) * rx + (p.z - zc.z) * rz, oU = (p.x - zc.x) * ux + (p.z - zc.z) * uz;
      const dR = (p.x - zPrev.x) * rx + (p.z - zPrev.z) * rz, dU = (p.x - zPrev.x) * ux + (p.z - zPrev.z) * uz;
      zPrev.copy(p);
      const sR = ZN.stillR * k, hR = ZN.hardR * k, sU = (oU >= 0 ? ZN.stillUp : ZN.stillDown) * k, hU = (oU >= 0 ? ZN.hardUp : ZN.hardDown) * k;
      const v = Math.hypot(vel.x, vel.z);
      if (v > 0.2 * SPEED && dt > 0) {                         // steady walking one way: the window travels with him
        const nx = vel.x / v, nz = vel.z / v, a = 1 - Math.exp(-dt / 0.35);
        if (zDir.lengthSq() < 0.01) zDir.set(nx, nz); else { zDir.x += (nx - zDir.x) * a; zDir.y += (nz - zDir.y) * a; }
        walkT = (nx * zDir.x + nz * zDir.y) / (zDir.length() || 1) > 0.7 ? walkT + dt : Math.max(0, walkT - 3 * dt);
      } else walkT = 0;
      const w = sm(ZN.leadAfter[0], ZN.leadAfter[1], walkT - dt * 0.5);
      const fR = dR * oR > 0 ? sm(sR, hR, Math.abs(oR - dR * 0.5)) : 0, fU = dU * oU > 0 ? sm(sU, hU, Math.abs(oU - dU * 0.5)) : 0;
      let mR = dR * Math.max(fR, w), mU = dU * Math.max(fU, w);
      oR -= mR; oU -= mU;
      if (w > 0 && dt > 0) {                                   // slide ahead of him, calmly (never faster than 1.2x his speed)
        const nx = vel.x / v, nz = vel.z / v, down = Math.max(0, -(nx * ux + nz * uz));
        const look = (ZN.lookAhead + (ZN.lookAheadSouth - ZN.lookAhead) * down) * k + v * ZN.smoothTime;
        const lR = Math.max(-(hR - 0.1 * k), Math.min(hR - 0.1 * k, -(nx * rx + nz * rz) * look));
        const lU = Math.max(-(ZN.hardDown - 0.1) * k, Math.min((ZN.hardUp - 0.1) * k, -(nx * ux + nz * uz) * look));
        const gR = oR - lR, gU = oU - lU, g = Math.hypot(gR, gU);
        if (g > 1e-5) { const d = Math.min(g * (1 - Math.exp(-dt / ZN.leadTau)), ZN.leadRate * v * dt) * w; mR += gR / g * d; mU += gU / g * d; oR -= gR / g * d; oU -= gU / g * d; }
      }
      const hU2 = (oU >= 0 ? ZN.hardUp : ZN.hardDown) * k;     // hard edges: he never leaves the window
      if (Math.abs(oR) > hR) mR += oR - Math.sign(oR) * hR;
      if (Math.abs(oU) > hU2) mU += oU - Math.sign(oU) * hU2;
      zc.x += mR * rx + mU * ux; zc.z += mR * rz + mU * uz;
      return frameAt(zc.x, zc.z);
    }
    const damp = (ax, g, omega, e, dt) => { const d = target[ax] - g, tmp = (tVel[ax] + omega * d) * dt; tVel[ax] = (tVel[ax] - omega * tmp) * e; target[ax] = g + (d + tmp) * e; };
    function camFollow(dt) {
      const fresh = !zoneLive, gl = zoneStep(dt);
      if (fresh) prevGoal.copy(gl);
      const omega = 2 / ZN.smoothTime, e = Math.exp(-omega * dt);
      damp('x', (gl.x + prevGoal.x) * 0.5, omega, e, dt); damp('y', (gl.y + prevGoal.y) * 0.5, omega, e, dt); damp('z', (gl.z + prevGoal.z) * 0.5, omega, e, dt);
      prevGoal.copy(gl);
    }
    // snap (place, walkPath, the first frame): the window centred on him, no glide
    const follow = (now) => { zoneLive = false; zoneStep(0); camOff.copy(goal); if (now) { target.copy(camOff); prevGoal.copy(camOff); tVel.set(0, 0, 0); } return camOff; };
    const sync = () => hero.group.position.set(heroPos.x, heroPos.y + 0.02, heroPos.z);
    const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const pose = (dt) => {                                    // heading (or the flip), lean and roll on the model
      const node = hero.pivot.children[0];
      if (H.heroTurn === 'flip') { hero.pivot.scale.x += (facing - hero.pivot.scale.x) * (1 - Math.exp(-dt * 14)); return; }
      hero.group.rotation.y = heading;
      if (node) { node.rotation.x = lean; node.rotation.z = -Math.max(-ROLL, Math.min(ROLL, 0.035 * yawRate)); }
    };
    function walkStep(dt) {
      let ix = 0, iz = 0;
      for (const c of keys) { ix += KEYS[c][0]; iz += KEYS[c][1]; }
      const il = Math.hypot(ix, iz), wx = il ? ix / il : 0, wz = il ? iz / il : 0;
      if (il) moved = true;
      // velocity: a constant-rate approach to the wanted one
      const dvx = wx * SPEED - vel.x, dvz = wz * SPEED - vel.z, dvl = Math.hypot(dvx, dvz), maxDv = ACCEL * dt;
      if (dvl <= maxDv) vel.set(wx * SPEED, 0, wz * SPEED); else { vel.x += dvx / dvl * maxDv; vel.z += dvz / dvl * maxDv; }
      const sp = Math.hypot(vel.x, vel.z);
      // heading: toward the input (or the remaining velocity while coasting), smoothed
      let dh = 0;
      if (il || sp > 0.05) { const want = il ? Math.atan2(wx, wz) : Math.atan2(vel.x, vel.z); dh = wrapA(want - heading) * (1 - Math.exp(-TURN * dt)); heading = wrapA(heading + dh); }
      yawRate += (dh / Math.max(dt, 1e-4) - yawRate) * (1 - Math.exp(-20 * dt));
      const x0 = heroPos.x, z0 = heroPos.z;
      if (sp > 1e-4) { walk.move(heroPos, vel.x * dt, vel.z * dt); if (vel.x) facing = Math.sign(vel.x); }
      const d = Math.hypot(heroPos.x - x0, heroPos.z - z0); walked += d;
      if (sp > 1e-4 && dt > 0 && d < sp * dt * 0.98) vel.set((heroPos.x - x0) / dt, 0, (heroPos.z - z0) / dt);   // blocked or sliding: keep only what the obstacle allowed
      gait += ((d > 1e-4 ? 1 : 0) - gait) * (1 - Math.exp(-dt * 10));
      // lean: an under-damped spring toward a forward lean that grows with speed (rocks once on stop)
      // sub-stepped at 240 Hz like paper-motion's Spring: one explicit step per frame flips the lean's sign every frame
      // (front / back flapping) once a frame is longer than ~1 / (2 x 0.75 x 21.4) = 31 ms, i.e. below ~32 fps
      const leanTo = LEAN * Math.min(1, sp / SPEED), ln = Math.max(1, Math.ceil(dt * 240)), lh = dt / ln;
      for (let i = 0; i < ln; i++) { leanV += (LEAN_W * LEAN_W * (leanTo - lean) - 2 * LEAN_Z * LEAN_W * leanV) * lh; lean += leanV * lh; }
      H.heroStride?.(walked, gait);
      sync(); pose(dt);
      if (!moved || looking) return;                          // the authored overview until he first moves; a look() frame holds
      camFollow(dt);
      if (target.distanceTo(shadowAt) > 2) { shadowAt.copy(target); fitShadow(lights, shadowAt); } // keep the shadow map on the view
    }
    let time = 0;
    function step(dt) {
      time += dt;
      for (const h of hinges) {
        h.update(dt);
        h.sway = h.swayAmp ? windSway(time, h.x, h.z, { amp: 1.6 * h.swayAmp, heroHeight }) : 0; // about the fold line
      }
      hero.pivot.rotation.y = Math.sin(time * 0.7) * 0.05;
      // until he first moves the hero rides whatever is under him (a quay, a terrace) as the world rises: a hero who
      // starts on a deck stands on it when it has risen, and his first step is from there
      if (!moved) { const s = walk.surface(heroPos.x, heroPos.z); if (s) heroPos.y = s.y; sync(); }
      if (flags.WALK) walkStep(dt);
      for (const fn of H.stepHooks) fn(time, dt);
      view.yaw += (view.tyaw - view.yaw) * (1 - Math.exp(-dt * 6));
      view.pitch += (view.tpitch - view.pitch) * (1 - Math.exp(-dt * 6));
      placeCamera(view.yaw + Math.sin(time * 0.21) * 0.5, view.pitch + Math.sin(time * 0.17) * 0.3);
    }
    let focusAt = null;            // look() focuses the lens on a point; otherwise it follows the hero
    function render() {
      const kd = view.dist / 66;
      if (focusAt) post.focus.copy(focusAt);
      else if (focus && !moved) post.focus.set(...focus);     // the overview's subject (createHarness({ focus }))
      else post.focus.set(hero.group.position.x - 3 * kd, 1.8 + hero.group.position.y, hero.group.position.z - 4 * kd);
      post.render(time);
    }
    function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); post.setSize(w, h); }
    addEventListener('resize', resize);
    resize();
    setOpen(true);
    heroPos.set(hero.group.position.x, 0, hero.group.position.z); HERO0.copy(heroPos); heading = heading0 = hero.group.rotation.y;
    let last = performance.now(), auto = true;
    renderer.setAnimationLoop((now) => { if (!auto) return; step(Math.min(0.05, Math.max(0, (now - last) / 1000))); last = now; render(); }); // dt clamped to [0, 50 ms]
    function restart() { // a full reset: hinges flat, the hero back at his start, the camera on its first view
      time = 0; for (const h of hinges) h.reset(0);
      heroPos.copy(HERO0); sync(); facing = 1; hero.pivot.scale.x = 1; moved = false; looking = false; view.dist = DIST0;
      heading = heading0; yawRate = 0; lean = 0; leanV = 0; vel.set(0, 0, 0); walked = 0; gait = 0; H.heroStride?.(0, 0); pose(0);
      target.copy(TARGET0); zoneLive = false; tVel.set(0, 0, 0); keys.clear(); focusAt = null; if (shadowAt.distanceTo(TARGET0) > 0.01) { shadowAt.copy(TARGET0); fitShadow(lights, shadowAt); }
      setOpen(true);
    }
    /** Scripted walk through the same walk field the keys use (blockers, feet and the step limit apply); the camera
     *  follows. Returns { reached, of, stuck, y, on, heights }: reached < of means the route is blocked. */
    function walkPath(points, o) {
      moved = true;
      const r = walk.route(heroPos, points, o); sync(); follow(true);
      const tr = r.trace, ta = tr[Math.max(0, tr.length - 8)], tz = tr[tr.length - 1];
      if (points.length) facing = Math.sign(points[points.length - 1][0] - tr[0][0]) || facing;
      if (ta && tz && Math.hypot(tz[0] - ta[0], tz[2] - ta[2]) > 1e-3) heading = Math.atan2(tz[0] - ta[0], tz[2] - ta[2]);   // facing the way he last walked
      if (H.heroTurn === 'flip') hero.pivot.scale.x = facing; else pose(0); // turned already: a capture right after never catches a turn
      return { reached: r.reached, of: points.length, stuck: r.stuck || null, blockedBy: r.blockedBy || null, y: +heroPos.y.toFixed(2), on: r.on ? (r.on.name || r.on.userData?.name || 'structure') : 'page',
        heights: r.trace.filter((_, i) => i % 15 === 0).map((q) => +q[1].toFixed(2)) };
    }
    /** A close review frame on a point (x, z): the camera at `dist` looking at it (y: default 1.5 above whatever is
     *  there: the page or a deck), the lens focused there. */
    function look(x, z, dist = 30, y = null) {
      const s = walk.surface(x, z); y ??= (s && s.y < 10 ? s.y : 0) + 1.5;   // a wall's placeholder height is not a floor
      view.dist = dist; target.set(x, y, z); focusAt = new THREE.Vector3(x, y, z); looking = true;
      placeCamera(view.yaw, view.pitch); camera.updateMatrixWorld(); shadowAt.copy(target); fitShadow(lights, shadowAt);
    }
    /** The walk field as text, far rows (z0) first: '#' blocked (water, a solid), '.' the page, 1-9 the height of a
     *  deck, '^' a wall (a surface set too high to step on), 'H' the hero. Print it to find an invisible blocker. */
    function walkMap(x0, z0, x1, z1, cell = 1) {
      const rows = [];
      for (let z = z0; z <= z1 + 1e-6; z += cell) {
        let row = '';
        for (let x = x0; x <= x1 + 1e-6; x += cell) {
          if (Math.abs(x - heroPos.x) <= cell / 2 && Math.abs(z - heroPos.z) <= cell / 2) { row += 'H'; continue; }
          const s = walk.surface(x, z); row += !s ? '#' : s.y >= 10 ? '^' : s.y < 0.15 ? '.' : String(Math.min(9, Math.max(1, Math.round(s.y))));
        }
        rows.push(row);
      }
      return rows.join('\n');
    }
    // capture hook: restart() folds everything flat and replays from t = 0, so step(0.8) is a true mid-rise frame;
    // step(sec) advances a fixed clock (stops the real-time loop) and renders
    window.__papercraft = { step(sec, fps = 60) { auto = false; for (let i = 0; i < Math.round(sec * fps); i++) step(1 / fps); render(); return time; }, restart,
      resume() { last = performance.now(); auto = true; }, toggle: () => setOpen(!up), setOpen, sound, post, scene, camera, pieces: hinges.length, walk, view, target, heroPos,
      place: (x, z) => { const s = walk.surface(x, z); if (!s) return null; heroPos.set(x, s.y, z); sync(); follow(true); return s.y; },
      walkPath, walkMap, look, spots, buildMs: Math.round(performance.now() - T0), ready: true }; // ready: the build is synchronous
  }
  return H;
}
