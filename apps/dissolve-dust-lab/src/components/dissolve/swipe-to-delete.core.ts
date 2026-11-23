/**
 * SwipeToDelete for the web, framework free, from dissolve (dissolve-ui). This file is yours.
 * The React component (swipe-to-delete.tsx) wraps it; it also runs on its own:
 *
 *   const row = createSwipeToDelete(li, { onDelete: () => li.remove(), rowClassName: 'rounded-2xl' });
 *   row.slot.append(content);
 *
 * A row you swipe left to delete, like Mail or WhatsApp. Past the threshold (or with a quick
 * flick) the row dissolves, the list closes up behind it, then onDelete runs. The action behind
 * the row reads --dissolve-danger.
 */
import { play } from './engine';
import { CALM, capture, clamp, el, injectStyle, propsOf, scope, value, vibrate } from './kit';

export type SwipeToDeleteProps = {
  /** Called once the row has dissolved and collapsed: remove the item from your data here. */
  onDelete?: () => void;
  /** Exit used when the row goes, a preset name of the engine (VARIANTS). Default 'dust'. */
  preset?: string;
  /** Fraction of the row width to drag before release deletes. A flick faster than 900 px/s deletes too. Default 0.4. */
  threshold?: number;
  /** Turns the swipe off. Default false. */
  disabled?: boolean;
  /** A short vibration when the row goes, where the browser has it. Default true. */
  haptics?: boolean;
  /** Clipping row classes: corner radius goes here (rounded-2xl...), the action follows it. */
  rowClassName?: string;
  /** Delete action revealed behind the row. */
  actionClassName?: string;
};

export type SwipeToDeleteInstance = {
  /** The row content: it slides with the pointer over the delete action. */
  slot: HTMLElement;
  update: (props: Partial<SwipeToDeleteProps>) => void;
  destroy: () => void;
};

const DEFAULTS = { preset: 'dust', threshold: 0.4, disabled: false, haptics: true };

/** Pan: activates past 12 px sideways, fails past 10 px vertically (activeOffsetX / failOffsetY). */
const ACTIVE_X = 12;
const FAIL_Y = 10;

// The native icon is built from views: handle, lid, a can open at the top, two lines.
const TRASH = `<svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden="true">
<path d="M7.5 0h5a1 1 0 0 1 1 1v1.5h-7V1a1 1 0 0 1 1-1z" fill="#fff"/>
<path d="M1.25 3.5h17.5a1.25 1.25 0 0 1 0 2.5H1.25a1.25 1.25 0 0 1 0-2.5z" fill="#fff"/>
<path d="M3.5 8v11a3 3 0 0 0 3 3h7a3 3 0 0 0 3-3V8" stroke="#fff" stroke-width="2"/>
<path d="M7.9 11v8M12.1 11v8" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/></svg>`;

const CSS = `
:where([data-dissolve="swipe-to-delete"]) { display: block; }
:where(.dissolve-swipe-clip) {
  position: relative; overflow: hidden; isolation: isolate;
  cursor: grab; touch-action: pan-y; user-select: none; -webkit-user-select: none;
}
:where(.dissolve-swipe-clip[data-dragging]) { cursor: grabbing; }
:where(.dissolve-swipe-clip[aria-disabled="true"]) { cursor: auto; }
:where(.dissolve-swipe-action) {
  position: absolute; inset: 0; visibility: hidden; display: flex; align-items: center; justify-content: flex-end;
  padding-right: 26px; background: var(--dissolve-danger, rgb(255 59 48));
}
:where(.dissolve-swipe-trash) { display: block; width: 20px; height: 24px; transform-origin: 50% 50%; opacity: 0; }
:where(.dissolve-swipe-trash) svg { display: block; }
:where(.dissolve-swipe-row) { position: relative; will-change: transform; }
`;

/** A swipeable row on host. host is the part that collapses once the row is gone. */
export function createSwipeToDelete(host: HTMLElement, initial: SwipeToDeleteProps = {}): SwipeToDeleteInstance {
  injectStyle('dissolve-swipe-to-delete', CSS);
  const props = propsOf(DEFAULTS, initial);
  const p = () => props.current;
  const sc = scope();

  host.dataset.dissolve = 'swipe-to-delete';
  const clip = el('div');
  const action = el('div');
  const icon = el('span', 'dissolve-swipe-trash', TRASH);
  action.append(icon);
  const slot = el('div', 'dissolve-swipe-row');
  clip.append(action, slot);
  host.append(clip);

  const width = () => clip.clientWidth || 1;
  const tx = value(sc, 0, () => {
    const x = tx.v;
    slot.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    const k = clamp(-x / (width() * p().threshold));
    icon.style.opacity = (k < 0.4 ? (k / 0.4) * 0.6 : 0.6 + ((k - 0.4) / 0.6) * 0.4).toFixed(3);
    icon.style.transform = `scale(${(0.6 + k * 0.48).toFixed(3)})`;
    action.style.visibility = x < -0.5 ? 'visible' : 'hidden';
  });
  tx.set(0);

  let busy = false;
  let h0 = 0, m0 = [0, 0];
  const collapse = value(sc, 1, () => {
    host.style.height = (h0 * collapse.v).toFixed(2) + 'px';
    host.style.marginTop = (m0[0] * collapse.v).toFixed(2) + 'px';
    host.style.marginBottom = (m0[1] * collapse.v).toFixed(2) + 'px';
  });

  async function commit() {
    busy = true;
    const { preset, haptics } = p();
    await tx.to(-width() * 0.45, 160, CALM);
    // The snapshot is what you see right now: the action and the row over it, clipped.
    const shot = await capture(clip);
    if (!sc.alive) return;
    clip.style.opacity = '0';
    if (haptics) vibrate([6, 40, 6]);
    await sc.track(play({ ...shot, preset })).done;
    if (!sc.alive) return;
    // Then the list closes up: height to 0 in 280 ms, calm curve, no bounce.
    const cs = getComputedStyle(host);
    h0 = host.offsetHeight;
    m0 = [parseFloat(cs.marginTop) || 0, parseFloat(cs.marginBottom) || 0];
    host.style.overflow = 'hidden';
    if (await collapse.to(0, 280, CALM)) p().onDelete?.();
  }

  let g: { id: number; x0: number; y0: number; on: boolean; base: number; start: number; samples: [number, number][] } | null = null;
  const onDown = (e: PointerEvent) => {
    if (busy || p().disabled || e.button > 0) return;
    g = { id: e.pointerId, x0: e.clientX, y0: e.clientY, on: false, base: 0, start: tx.v, samples: [] };
  };
  const onMove = (e: PointerEvent) => {
    if (!g || e.pointerId !== g.id) return;
    const dx = e.clientX - g.x0, dy = e.clientY - g.y0;
    if (!g.on) {
      if (Math.abs(dy) > FAIL_Y && Math.abs(dx) <= ACTIVE_X) { g = null; return; }
      if (Math.abs(dx) <= ACTIVE_X) return;
      g.on = true;
      g.base = e.clientX;
      g.start = tx.v;
      try { clip.setPointerCapture(e.pointerId); } catch { /* synthetic pointers cannot be captured */ }
      clip.dataset.dragging = '';
    }
    const next = g.start + (e.clientX - g.base);
    // Free to the left, a little rubber band to the right.
    tx.set(next > 0 ? next * 0.25 : next);
    const now = performance.now();
    g.samples.push([now, e.clientX]);
    while (g.samples.length > 2 && now - g.samples[0][0] > 80) g.samples.shift();
  };
  const onEnd = (e: PointerEvent) => {
    if (!g || e.pointerId !== g.id) return;
    const { on, samples: s } = g;
    g = null;
    delete clip.dataset.dragging;
    if (!on) return;
    let vx = 0;
    if (s.length > 1) {
      const [t0, x0] = s[0], [t1, x1] = s[s.length - 1];
      vx = t1 > t0 ? ((x1 - x0) / (t1 - t0)) * 1000 : 0;
    }
    if (-tx.v > width() * p().threshold || vx < -900) commit();
    else tx.to(0, 300, CALM);
  };
  clip.addEventListener('pointerdown', onDown);
  clip.addEventListener('pointermove', onMove);
  clip.addEventListener('pointerup', onEnd);
  clip.addEventListener('pointercancel', onEnd);
  clip.addEventListener('lostpointercapture', onEnd);

  function apply() {
    const { rowClassName, actionClassName, disabled } = p();
    clip.className = 'dissolve-swipe-clip' + (rowClassName ? ' ' + rowClassName : '');
    action.className = 'dissolve-swipe-action' + (actionClassName ? ' ' + actionClassName : '');
    clip.setAttribute('aria-disabled', String(disabled));
    if (disabled && g) { g = null; delete clip.dataset.dragging; tx.to(0, 300, CALM); }
  }
  apply();

  return {
    slot,
    update(next) {
      if (props.update(next).size) apply();
    },
    destroy() {
      sc.dispose();
      clip.remove();
      for (const k of ['height', 'overflow', 'margin-top', 'margin-bottom']) host.style.removeProperty(k);
      delete host.dataset.dissolve;
    },
  };
}
