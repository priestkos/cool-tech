/**
 * ScratchCard for the web, framework free, from dissolve (dissolve-ui). This file is yours.
 * The React component (scratch-card.tsx) wraps it; it also runs on its own:
 *
 *   const card = createScratchCard(el, { onReveal: claim });
 *   card.slot.innerHTML = '<strong>$25</strong>';
 *
 * The foil texture (metal gradient, grain, brushed streaks, bevel, embossed label) is painted once;
 * every frame adds the light that moves with the tilt (bands, holographic tint, specular), then
 * cuts the scratched mask out of it. Same grid coverage, grains, tilt springs and threshold as the
 * React Native version. The foil is an explicit color, not a theme token, like a printed ticket;
 * the card under it follows --dissolve-surface and --dissolve-foreground.
 */
import { DPR, play } from './engine';
import { CALM, clamp, el, fontOf, hash, hex, injectStyle, loop, propsOf, rectOf, reducedMotion, scope, value, vibrate } from './kit';

export type ScratchCardProps = {
  /** Card width in px. Default 320. */
  width?: number;
  /** Card height in px. Default 200. */
  height?: number;
  /** Corner radius. Default 24. */
  radius?: number;
  /** Foil base color. Default '#C3C8D0' (silver). A warm tone like '#D9B26F' gives gold. */
  color?: string;
  /** Text printed on the foil, erased with it. Empty hides it. Default 'Scratch to reveal'. */
  label?: string;
  /** Scratch stroke width in px. Default 38. */
  brush?: number;
  /** Share of the foil to scratch before the rest dissolves, 0..1. Default 0.55. */
  threshold?: number;
  /** Max tilt in degrees under the pointer. 0 keeps the card flat. Default 9. Off under reduced motion. */
  tilt?: number;
  /** Vibration ticks while scratching and on reveal, where the browser has it. Default true. */
  haptics?: boolean;
  /** No scratching (the card still shows). Default false. */
  disabled?: boolean;
  /** Called once the foil is gone. */
  onReveal?: () => void;
  /** Called on the first stroke after mount or reset. */
  onScratchStart?: () => void;
  /** Card classes (background, border...). */
  className?: string;
  /** Classes of the box that centers the content. */
  contentClassName?: string;
};

export type ScratchCardHandle = {
  /** Puts the foil back, untouched. */
  reset: () => void;
  /** Dissolves the remaining foil now, as if the threshold was reached. */
  reveal: () => Promise<void>;
  /** Share of the foil scratched so far, 0..1. */
  progress: () => number;
};

export type ScratchCardInstance = ScratchCardHandle & {
  /** The centered box under the foil: put the reward here. */
  slot: HTMLElement;
  update: (props: Partial<ScratchCardProps>) => void;
  destroy: () => void;
};

const DEFAULTS = {
  width: 320, height: 200, radius: 24, color: '#C3C8D0', label: 'Scratch to reveal',
  brush: 38, threshold: 0.55, tilt: 9, haptics: true, disabled: false,
};

/** Coverage grid: columns across the card, rows follow the aspect ratio. */
const COLS = 24;
/** Grain pool, recycled in a ring. Per grain: x y vx vy born life size shade. */
const N = 160;
const G = 8;
/** Room the falling grains get around the card. */
const PAD = 40;
const FALL = 160;
const GRAVITY = 1100;
/** Px of fresh foil scratched between two haptic ticks. */
const TICK = 22;
/** Tilt springs: soft while following the pointer, a little bounce on the way back. */
const FOLLOW = { stiffness: 220, damping: 20, eps: 0.002 };
const BACK = { stiffness: 150, damping: 11, eps: 0.002 };
/** Direction of the light bands and the specular sweep. */
const DIR = (() => { const l = Math.hypot(1, 0.55); return [1 / l, 0.55 / l]; })();
const TAU = Math.PI * 2;

const CSS = `
:where([data-dissolve="scratch-card"]) { position: relative; flex: none; user-select: none; -webkit-user-select: none; }
:where(.dissolve-scratch-card) {
  position: absolute; inset: 0; overflow: hidden;
  background: var(--dissolve-surface, rgb(242 242 247));
  box-shadow: 0 18px 34px -14px rgba(0, 0, 0, 0.32), 0 2px 6px rgba(0, 0, 0, 0.1);
  touch-action: none; cursor: grab; will-change: transform; -webkit-tap-highlight-color: transparent;
}
:where(.dissolve-scratch-card[data-scratching]) { cursor: grabbing; }
:where(.dissolve-scratch-card[aria-disabled="true"]) { cursor: default; }
:where(.dissolve-scratch-content) {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: var(--dissolve-foreground, rgb(28 28 30));
}
:where(.dissolve-scratch-foil) { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
:where(.dissolve-scratch-sheen) {
  position: absolute; top: -25%; bottom: -25%; left: -50%; right: -50%; pointer-events: none;
  background: linear-gradient(115deg, rgba(255, 255, 255, 0) 38%, rgba(255, 255, 255, 0.16) 50%, rgba(255, 255, 255, 0) 62%);
}
:where(.dissolve-scratch-rim) { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 0 0 0.5px rgba(0, 0, 0, 0.08); }
:where(.dissolve-scratch-dust) { position: absolute; pointer-events: none; }
`;

const shade = ([r, g, b]: number[], k: number, a = 1) => `rgba(${Math.round(clamp(r * k, 0, 255))}, ${Math.round(clamp(g * k, 0, 255))}, ${Math.round(clamp(b * k, 0, 255))}, ${a})`;

/**
 * One scratch stamp: a polygon of `verts` points at radius r, each pulled in by up to 20 percent,
 * sometimes one deep chip. Seeded by id, so it never flickers.
 */
function chip(x: CanvasRenderingContext2D, cx: number, cy: number, r: number, id: number, verts: number) {
  const a0 = hash(id, 11) * TAU;
  const deep = hash(id, 12) < 0.18 ? Math.floor(hash(id, 13) * verts) : -1;
  x.beginPath();
  for (let v = 0; v < verts; v++) {
    const k = v === deep ? 0.55 : 0.8 + 0.2 * hash(id, 20 + v);
    const a = a0 + (v / verts) * TAU;
    const px = cx + Math.cos(a) * r * k, py = cy + Math.sin(a) * r * k;
    if (v === 0) x.moveTo(px, py); else x.lineTo(px, py);
  }
  x.closePath();
  x.fill();
}

/** The static foil: metal gradient, grain, brushed streaks, bevel and the embossed label. */
function foilTexture(W: number, H: number, R: number, base: number[], label: string, font: string) {
  const c = document.createElement('canvas');
  c.width = Math.round(W * DPR);
  c.height = Math.round(H * DPR);
  const x = c.getContext('2d')!;
  x.scale(DPR, DPR);
  x.beginPath();
  x.roundRect(0, 0, W, H, R);
  x.clip();
  const g = x.createLinearGradient(0, 0, W, H);
  [[0, 0.86], [0.22, 1.06], [0.42, 0.84], [0.63, 1.02], [0.82, 0.9], [1, 0.8]].forEach(([s, k]) => g.addColorStop(s, shade(base, k)));
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  // A touch darker toward the bottom, like a lit surface.
  const v = x.createLinearGradient(0, H * 0.45, 0, H);
  v.addColorStop(0, 'rgba(0, 0, 0, 0)');
  v.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
  x.fillStyle = v;
  x.fillRect(0, 0, W, H);
  // Grain and brushed streaks, in device pixels.
  const img = x.getImageData(0, 0, c.width, c.height), d = img.data, cw = c.width;
  const streak = new Float32Array(c.height * 8);
  for (let i = 0; i < streak.length; i++) streak[i] = Math.random() - 0.5;
  const seg = Math.max(1, Math.round(36 * DPR));
  for (let p = 0, i = 0; p < d.length; p += 4, i++) {
    const py = (i / cw) | 0, px = i - py * cw;
    const n = (Math.random() - 0.5) * 18 + streak[(py * 8 + ((px / seg) | 0)) % streak.length] * 9;
    d[p] += n; d[p + 1] += n; d[p + 2] += n;
  }
  x.putImageData(img, 0, 0);
  // Bevel: lit top left rim, shaded bottom right rim.
  const b = x.createLinearGradient(0, 0, W * 0.4, H);
  b.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  b.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
  b.addColorStop(1, 'rgba(0, 0, 0, 0.14)');
  x.lineWidth = 3;
  x.strokeStyle = b;
  x.beginPath();
  x.roundRect(1.5, 1.5, W - 3, H - 3, R - 1.5);
  x.stroke();
  if (label) {
    x.font = `600 15px ${font}`;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillStyle = 'rgba(255, 255, 255, 0.55)';
    x.fillText(label, W / 2, H / 2 + 1);
    x.fillStyle = `rgba(${Math.round(base[0] * 0.42)}, ${Math.round(base[1] * 0.42)}, ${Math.round(base[2] * 0.45)}, 0.78)`;
    x.fillText(label, W / 2, H / 2);
  }
  return c;
}

/**
 * A scratch card in el. Drag over the foil to erase it; past the threshold the rest of the foil
 * dissolves and the content is yours. The card tilts with the pointer and its light follows.
 */
export function createScratchCard(host: HTMLElement, initial: ScratchCardProps = {}): ScratchCardInstance {
  injectStyle('dissolve-scratch-card', CSS);
  const props = propsOf(DEFAULTS, initial);
  const p = () => props.current;
  const sc = scope();

  host.dataset.dissolve = 'scratch-card';
  const card = el('div');
  card.setAttribute('role', 'img');
  const slot = el('div');
  const fv = el('canvas', 'dissolve-scratch-foil');
  const sheen = el('div', 'dissolve-scratch-sheen');
  const rim = el('div', 'dissolve-scratch-rim');
  card.append(slot, fv, sheen, rim);
  const dust = el('canvas', 'dissolve-scratch-dust');
  host.append(card, dust);

  const fx = fv.getContext('2d')!;
  const dx = dust.getContext('2d')!;
  const mask = document.createElement('canvas');
  const mx = mask.getContext('2d')!;

  let W = 0, H = 0, rows = 0, DW = 0, DH = 0;
  let base = hex(DEFAULTS.color);
  let tex: HTMLCanvasElement | null = null;
  let cells = new Uint8Array(0), covered = 0, done = false, gone = false, dirty = true, started = false;
  const grains = new Float32Array(N * G);
  let head = 0, seq = 0, liveGrains = 0, fresh = 0;
  let revealing: Promise<void> | null = null;
  const maxTilt = () => (reducedMotion() ? 0 : p().tilt);

  const tx = value(sc, 0, () => { dirty = true; kick(); });
  const ty = value(sc, 0, () => { dirty = true; kick(); });
  const press = value(sc, 0, () => { dirty = true; kick(); });

  /** Sizes everything for the current width and height, with a fresh foil. */
  function layout() {
    W = p().width; H = p().height;
    rows = Math.max(4, Math.round((COLS * H) / W));
    host.style.width = W + 'px';
    host.style.height = H + 'px';
    fv.width = mask.width = Math.round(W * DPR);
    fv.height = mask.height = Math.round(H * DPR);
    DW = W + PAD * 2; DH = H + PAD + FALL;
    dust.width = Math.round(DW * DPR);
    dust.height = Math.round(DH * DPR);
    Object.assign(dust.style, { left: -PAD + 'px', top: -PAD + 'px', width: DW + 'px', height: DH + 'px' });
    cells = new Uint8Array(COLS * rows);
    covered = 0;
    mx.setTransform(DPR, 0, 0, DPR, 0, 0);
    mx.fillStyle = '#000';
  }

  function paint() {
    const { radius, color, label } = p();
    base = hex(color);
    card.style.borderRadius = radius + 'px';
    tex = foilTexture(W, H, radius, base, label, fontOf(host));
    dirty = true;
    kick();
  }

  function decorate() {
    const { className, contentClassName, disabled, label } = p();
    card.className = 'dissolve-scratch-card' + (className ? ' ' + className : '');
    slot.className = 'dissolve-scratch-content' + (contentClassName ? ' ' + contentClassName : '');
    card.setAttribute('aria-label', gone ? 'Revealed' : label || 'Scratch card');
    card.setAttribute('aria-disabled', String(disabled));
  }

  function drawFoil() {
    if (!tex) return;
    const a = tx.v, b = ty.v;
    fx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fx.globalCompositeOperation = 'source-over';
    fx.clearRect(0, 0, W, H);
    fx.drawImage(tex, 0, 0, W, H);
    const S = W * DIR[0] + H * DIR[1];
    const lin = () => fx.createLinearGradient(W / 2 - (DIR[0] * S) / 2, H / 2 - (DIR[1] * S) / 2, W / 2 + (DIR[0] * S) / 2, H / 2 + (DIR[1] * S) / 2);
    // Soft metal bands that slide with the tilt.
    const bands = lin(), off = (a * 0.22 + b * 0.14) % 0.25;
    for (let i = -1; i <= 5; i++) {
      const s = i * 0.25 + off;
      if (s >= 0 && s <= 1) bands.addColorStop(s, 'rgba(255, 255, 255, 0.10)');
      if (s + 0.125 >= 0 && s + 0.125 <= 1) bands.addColorStop(s + 0.125, 'rgba(0, 0, 0, 0.06)');
    }
    fx.globalCompositeOperation = 'source-atop';
    fx.fillStyle = bands;
    fx.fillRect(0, 0, W, H);
    // Holographic hint: a pastel spectrum that drifts as the card turns.
    const holo = lin(), h0 = (a * 0.3 - b * 0.2) * 360;
    for (let i = 0; i <= 6; i++) holo.addColorStop(i / 6, `hsla(${(h0 + i * 60 + 360) % 360}, 80%, 62%, 0.08)`);
    fx.globalCompositeOperation = 'overlay';
    fx.fillStyle = holo;
    fx.fillRect(0, 0, W, H);
    // Specular band, lit from where the card leans.
    const u = 0.5 + (-0.18 - a * 0.42 - b * 0.24);
    const spec = lin();
    const st = (s: number, al: number) => { if (s >= 0 && s <= 1) spec.addColorStop(s, `rgba(255, 255, 255, ${al})`); };
    st(0, 0); st(clamp(u - 0.32), 0); st(clamp(u - 0.1), 0.08); st(clamp(u - 0.04), 0.16); st(clamp(u), 0.42); st(clamp(u + 0.04), 0.16); st(clamp(u + 0.1), 0.08); st(clamp(u + 0.32), 0); st(1, 0);
    fx.globalCompositeOperation = 'source-atop';
    fx.fillStyle = spec;
    fx.fillRect(0, 0, W, H);
    // Cut the scratched foil out.
    fx.globalCompositeOperation = 'destination-out';
    fx.drawImage(mask, 0, 0, W, H);
    fx.globalCompositeOperation = 'source-over';
  }

  function applyCard() {
    const k = clamp(press.v, -0.2, 1.2), t = maxTilt();
    card.style.transform = `perspective(900px) rotateX(${(-ty.v * t).toFixed(3)}deg) rotateY(${(tx.v * t).toFixed(3)}deg) scale(${(1 - k * 0.012).toFixed(4)})`;
    sheen.style.transform = `translate(${(-tx.v * W * 0.28).toFixed(1)}px, ${(-ty.v * H * 0.2).toFixed(1)}px)`;
  }

  function drawDust(dt: number, now: number) {
    dx.setTransform(DPR, 0, 0, DPR, 0, 0);
    dx.clearRect(0, 0, DW, DH);
    let alive = 0;
    for (let i = 0; i < N; i++) {
      const k = i * G;
      if (grains[k + 5] <= 0) continue;
      if (grains[k + 4] < 0) grains[k + 4] = now;
      const age = (now - grains[k + 4]) / grains[k + 5];
      if (age >= 1) { grains[k + 5] = 0; continue; }
      alive++;
      grains[k + 2] *= 1 - 1.2 * dt;
      grains[k + 3] += GRAVITY * dt;
      grains[k] += grains[k + 2] * dt;
      grains[k + 1] += grains[k + 3] * dt;
      const fade = age < 0.55 ? 1 : 1 - (age - 0.55) / 0.45;
      dx.fillStyle = shade(base, grains[k + 7], fade * fade);
      dx.beginPath();
      dx.arc(grains[k] + PAD, grains[k + 1] + PAD, (grains[k + 6] * (1 - 0.4 * age)) / 2, 0, TAU);
      dx.fill();
    }
    liveGrains = alive;
  }

  let last = 0;
  const { kick } = loop(sc, host, (now) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    applyCard();
    if (dirty && !gone) { drawFoil(); dirty = false; }
    drawDust(dt, now);
  }, () => {
    const busy = liveGrains > 0 || dirty;
    if (!busy) last = 0;
    return busy;
  });

  /** Marks the grid cells the segment (x0 y0) to (x1 y1) uncovers. Returns how many were new. */
  function mark(x0: number, y0: number, x1: number, y1: number) {
    const r = p().brush / 2, cw = W / COLS, ch = H / rows;
    const c0 = Math.max(0, Math.floor((Math.min(x0, x1) - r) / cw)), c1 = Math.min(COLS - 1, Math.floor((Math.max(x0, x1) + r) / cw));
    const r0 = Math.max(0, Math.floor((Math.min(y0, y1) - r) / ch)), r1 = Math.min(rows - 1, Math.floor((Math.max(y0, y1) + r) / ch));
    const ddx = x1 - x0, ddy = y1 - y0, len2 = ddx * ddx + ddy * ddy;
    let added = 0;
    for (let j = r0; j <= r1; j++) for (let i = c0; i <= c1; i++) {
      const k = j * COLS + i;
      if (cells[k]) continue;
      const cx = (i + 0.5) * cw, cy = (j + 0.5) * ch;
      const t = len2 > 0 ? clamp(((cx - x0) * ddx + (cy - y0) * ddy) / len2) : 0;
      const ex = x0 + ddx * t - cx, ey = y0 + ddy * t - cy;
      if (ex * ex + ey * ey <= r * r) { cells[k] = 1; added++; }
    }
    covered += added;
    return added;
  }

  /** Sheds n foil grains around (x, y), flicked against the stroke direction. */
  function shed(x: number, y: number, ux: number, uy: number, n: number) {
    if (reducedMotion()) return;
    const r = p().brush / 2;
    for (let q = 0; q < n; q++) {
      const s = seq++, k = head * G;
      head = (head + 1) % N;
      const a = hash(s, 1) * TAU, d = r * (0.35 + 0.6 * hash(s, 2));
      grains[k] = x + Math.cos(a) * d;
      grains[k + 1] = y + Math.sin(a) * d;
      const flick = 60 + hash(s, 3) * 140;
      grains[k + 2] = -ux * flick * 0.6 + (hash(s, 4) - 0.5) * 160;
      grains[k + 3] = -uy * flick * 0.4 - 90 - hash(s, 5) * 120;
      grains[k + 4] = -1;
      grains[k + 5] = 520 + hash(s, 6) * 420;
      grains[k + 6] = 1.6 + hash(s, 7) * 2.2;
      grains[k + 7] = 0.7 + hash(s, 8) * 0.5;
    }
    liveGrains = Math.max(liveGrains, 1);
  }

  /** Live stroke: last point (NaN between strokes), distance to the next stamp, stamps laid, width, stamp id, direction. */
  let lx = NaN, ly = NaN, lt = 0;
  let carry = 0, laid = 0, nib = 1, sid = 0, ldx = 0, ldy = 0;

  /**
   * Lays the stroke from the last point to (x, y) as stamps a third of their radius apart, each a
   * chipped polygon whose width follows the speed: a ragged nail or coin scratch, not a round brush.
   */
  function lay(x: number, y: number, speed: number) {
    const brush = p().brush;
    const px = lx === lx ? lx : x, py = ly === ly ? ly : y;
    const ddx = x - px, ddy = y - py, d = Math.hypot(ddx, ddy);
    if (d > 0.5) { ldx = ddx / d; ldy = ddy / d; }
    const target = 1.08 - Math.min(0.4, speed / 2600);
    let t = carry;
    while (t <= d) {
      const k = d > 0 ? t / d : 0;
      nib += (target - nib) * 0.2;
      const id = sid++, n = laid++;
      const taper = n < 3 ? 0.55 + n * 0.15 : 1;
      const r = (brush / 2) * nib * (0.86 + 0.18 * hash(id, 31)) * taper;
      const cx = px + ddx * k, cy = py + ddy * k;
      chip(mx, cx, cy, r, id, 11);
      if (hash(id, 32) < 0.4) {
        const side = hash(id, 33) < 0.5 ? -1 : 1, off = r * (0.82 + 0.2 * hash(id, 34));
        chip(mx, cx - ldy * side * off, cy + ldx * side * off, r * (0.12 + 0.14 * hash(id, 35)), id + 7919, 6);
      }
      t += Math.max(2, r * 0.38);
      if (d === 0) break;
    }
    carry = t - d;
  }

  /** Rough end of a stroke: a couple of small chips just past the last point. */
  function lift() {
    if (lx !== lx || done) return;
    const id = sid++, r = (p().brush / 2) * nib;
    chip(mx, lx + ldx * r * 0.45, ly + ldy * r * 0.45, r * (0.3 + 0.15 * hash(id, 36)), id, 8);
    chip(mx, lx + ldx * r * 0.7 - ldy * r * 0.25, ly + ldy * r * 0.7 + ldx * r * 0.25, r * 0.14, id + 7919, 6);
    dirty = true;
    kick();
  }

  function tiltTo(x: number, y: number) {
    if (!maxTilt()) return;
    tx.spring(clamp((x / W) * 2 - 1, -1, 1), FOLLOW);
    ty.spring(clamp((y / H) * 2 - 1, -1, 1), FOLLOW);
  }

  function down(x: number, y: number) {
    tiltTo(x, y);
    if (maxTilt()) press.spring(1, FOLLOW);
    if (done) return;
    lx = ly = NaN;
    carry = 0; laid = 0; nib = 1;
    lay(x, y, 0);
    lx = x; ly = y; lt = performance.now();
    const added = mark(x, y, x, y);
    if (added) shed(x, y, 0, 0, Math.min(6, 2 + added));
    if (!started) { started = true; p().onScratchStart?.(); }
    dirty = true;
    kick();
  }

  function move(x: number, y: number) {
    tiltTo(x, y);
    if (done || lx !== lx) return;
    const ddx = x - lx, ddy = y - ly, d = Math.hypot(ddx, ddy);
    if (d < 2.5) return;
    const now = performance.now(), dt = Math.max(4, now - lt);
    lt = now;
    lay(x, y, (d / dt) * 1000);
    const added = mark(lx, ly, x, y);
    const ux = ddx / (d || 1), uy = ddy / (d || 1);
    if (added) {
      shed(x, y, ux, uy, Math.min(7, 1 + Math.ceil(added * 0.8) + Math.floor(d / 14)));
      fresh += d;
      if (fresh >= TICK) { fresh = 0; if (p().haptics) vibrate(4); }
    } else if (hash(seq++, 9) < 0.25) shed(x, y, ux, uy, 1);
    lx = x; ly = y;
    dirty = true;
    kick();
    if (covered >= p().threshold * COLS * rows) finish(x, y);
  }

  function up() {
    lift();
    lx = ly = NaN;
    tx.spring(0, BACK);
    ty.spring(0, BACK);
    press.spring(0, BACK);
  }

  function finish(ox: number, oy: number) {
    if (done && revealing) return revealing;
    done = true;
    started = true;
    revealing = (async () => {
      // Flat again before the dust, so it starts exactly where the foil sits.
      tx.to(0, 160, CALM);
      ty.to(0, 160, CALM);
      press.to(0, 160, CALM);
      await sc.wait(170);
      applyCard();
      drawFoil();
      const success = () => {
        gone = true;
        decorate();
        if (p().haptics) vibrate([10, 40, 18]);
        p().onReveal?.();
      };
      if (reducedMotion()) {
        fv.style.transition = 'opacity .22s';
        fv.style.opacity = '0';
        await sc.wait(220);
        success();
        return;
      }
      const h = sc.track(play({ source: fv, ...rectOf(fv), preset: 'dust', origin: { x: ox, y: oy }, duration: 1100 }));
      fv.style.opacity = '0';
      success();
      await h.done;
    })();
    return revealing;
  }

  function reset() {
    cells = new Uint8Array(COLS * rows);
    covered = 0;
    done = gone = started = false;
    revealing = null;
    lx = ly = NaN;
    fresh = 0;
    mx.setTransform(1, 0, 0, 1, 0, 0);
    mx.clearRect(0, 0, mask.width, mask.height);
    mx.setTransform(DPR, 0, 0, DPR, 0, 0);
    decorate();
    dirty = true;
    drawFoil();
    fv.style.transition = 'none';
    fv.style.opacity = '0';
    void fv.offsetWidth;
    fv.style.transition = 'opacity .32s cubic-bezier(0.32, 0.72, 0, 1)';
    fv.style.opacity = '1';
    kick();
  }

  // Pointer: coordinates on the flat host (the card itself is tilted), in layout units, so a
  // card scaled down by a transform still scratches under the pointer.
  let ptr: number | null = null;
  const local = (e: PointerEvent): [number, number] => {
    const r = host.getBoundingClientRect(), s = r.width / host.offsetWidth || 1;
    return [(e.clientX - r.left) / s, (e.clientY - r.top) / s];
  };
  card.addEventListener('pointerdown', (e) => {
    if (e.button > 0 || p().disabled) return;
    ptr = e.pointerId;
    try { card.setPointerCapture(e.pointerId); } catch { /* synthetic pointers cannot be captured */ }
    card.dataset.scratching = '';
    down(...local(e));
  });
  card.addEventListener('pointermove', (e) => {
    if (ptr !== e.pointerId) return;
    const events = e.getCoalescedEvents?.();
    for (const ev of events?.length ? events : [e]) move(...local(ev));
  });
  const end = (e: PointerEvent) => {
    if (ptr !== e.pointerId) return;
    ptr = null;
    delete card.dataset.scratching;
    up();
  };
  card.addEventListener('pointerup', end);
  card.addEventListener('pointercancel', end);

  layout();
  decorate();
  paint();
  applyCard();
  drawFoil();

  return {
    slot,
    reset,
    reveal: () => finish(W / 2, H / 2),
    progress: () => covered / (COLS * rows),
    update(next) {
      const changed = props.update(next);
      if (!changed.size) return;
      if (changed.has('width') || changed.has('height')) { layout(); reset(); }
      if (changed.has('width') || changed.has('height') || changed.has('radius') || changed.has('color') || changed.has('label')) paint();
      decorate();
      kick();
    },
    destroy() {
      sc.dispose();
      card.remove();
      dust.remove();
      delete host.dataset.dissolve;
      host.style.removeProperty('width');
      host.style.removeProperty('height');
    },
  };
}
