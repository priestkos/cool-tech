/**
 * GlossyButton for the web, framework free, from dissolve (dissolve-ui). This file is yours.
 * The React component (glossy-button.tsx) wraps it; it also runs on its own:
 *
 *   const b = createGlossyButton(document.querySelector('button')!, { label: 'Get started', onPress: start });
 *
 * A tactile pill, slightly 3D and lit from the inside, in plain CSS:
 *   - fill: color, label: labelColor, fully rounded by default
 *   - stroke: 1 px inside, a white gradient lit from the top (strokeOpacity at the top, 0 at the bottom)
 *   - drop shadow: black at shadowOpacity, y shadowY, blur shadowBlur
 *   - inner shadow: white at innerOpacity, blur innerBlur, spread innerSpread
 *   - ring: an outer shadow in the fill color, spread ringSpread, no blur
 * Pressed, it scales to 0.97 on a crisp spring and the inner light dims. The fill is an explicit
 * brand color, not a theme token, so the button looks the same in light and dark mode.
 */
import { clamp, el, injectStyle, propsOf, reducedMotion, scope, value, vibrate } from './kit';

export const GLOSSY_SIZES = {
  sm: { height: 36, padding: 14, font: 14, icon: 14, gap: 6 },
  md: { height: 44, padding: 18, font: 15, icon: 16, gap: 7 },
  lg: { height: 52, padding: 22, font: 17, icon: 18, gap: 8 },
} as const;

export type GlossyButtonSize = keyof typeof GLOSSY_SIZES;

export type GlossyButtonProps = {
  /** Label text, used when nothing else is put in the label slot. */
  label?: string;
  onPress?: () => void;
  /** Fill, also the color of the outer ring. Default '#296FF0'. */
  color?: string;
  /** Label and icon color. Default '#FFFFFF'. */
  labelColor?: string;
  /** Corner radius. Default 999 (a pill), capped at half the height. */
  radius?: number;
  /** Height, padding and type size: 36, 44 or 52 px. Default 'md'. */
  size?: GlossyButtonSize;
  /** Stretch to the full width of the parent. Default false (hugs its label). */
  fullWidth?: boolean;
  /** Top opacity of the 1 px white gradient stroke. Default 0.4. */
  strokeOpacity?: number;
  /** Inner white shadow: opacity, blur and spread. Defaults 0.24, 6, 2. */
  innerOpacity?: number;
  innerBlur?: number;
  innerSpread?: number;
  /** Black drop shadow: opacity, y offset and blur. Defaults 0.2, 3, 6. */
  shadowOpacity?: number;
  shadowY?: number;
  shadowBlur?: number;
  /** Outer ring in the fill color, no blur. 0 removes it. Default 1. */
  ringSpread?: number;
  /** Half opacity, no press. Default false. */
  disabled?: boolean;
  /** A short vibration on press in, where the browser has it. Default true. */
  haptics?: boolean;
  /** Label classes (weight, tracking...). The color comes from labelColor. */
  labelClassName?: string;
};

export type GlossyButtonInstance = {
  /** The label box: text or any node. */
  slot: HTMLElement;
  /** The leading icon box, hidden while empty. Draw it in currentColor. */
  icon: HTMLElement;
  update: (props: Partial<GlossyButtonProps>) => void;
  destroy: () => void;
};

const DEFAULTS = {
  color: '#296FF0', labelColor: '#FFFFFF', radius: 999, size: 'md' as GlossyButtonSize, fullWidth: false,
  strokeOpacity: 0.4, innerOpacity: 0.24, innerBlur: 6, innerSpread: 2,
  shadowOpacity: 0.2, shadowY: 3, shadowBlur: 6, ringSpread: 1, disabled: false, haptics: true,
};

/** Crisp and small: settles fast with a hint of bounce. */
const SPRING = { stiffness: 260, damping: 22, eps: 0.002 };
const PRESSED_SCALE = 0.97;
/** How much of the inner light is left while pressed. */
const PRESSED_LIGHT = 0.55;

/**
 * The pill itself, inline: page resets (button { background: none; padding: 0 }) would beat any
 * stylesheet rule as weak as :where(). Its look comes from the props, as on native, where className
 * only reaches the outer box.
 */
const PILL: Partial<CSSStyleDeclaration> = {
  position: 'relative', alignItems: 'center', justifyContent: 'center', flex: 'none', boxSizing: 'border-box',
  height: 'var(--glossy-h)', padding: '0 var(--glossy-pad)', gap: 'var(--glossy-gap)', border: '0',
  borderRadius: 'var(--glossy-r)', background: 'var(--glossy-fill)', color: 'var(--glossy-label)',
  fontFamily: 'inherit', fontSize: 'var(--glossy-font)', fontWeight: '600', lineHeight: '1', letterSpacing: '-0.013em', whiteSpace: 'nowrap',
  boxShadow: '0 var(--glossy-sh-y) var(--glossy-sh-b) rgba(0, 0, 0, var(--glossy-sh-o)), 0 0 0 var(--glossy-ring) var(--glossy-fill)',
  transform: 'scale(var(--glossy-scale, 1))', willChange: 'transform',
  touchAction: 'manipulation',
};

/** The layers the inline style cannot reach: the gradient stroke, the inner light, focus, the slots. */
const CSS = `
:where([data-dissolve="glossy-button"]) { -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }
:where([data-dissolve="glossy-button"]:focus-visible) { outline: 2px solid var(--dissolve-accent, rgb(10 132 255)); outline-offset: 4px; }
:where([data-dissolve="glossy-button"])::before, :where([data-dissolve="glossy-button"])::after { content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; }
:where([data-dissolve="glossy-button"])::before {
  padding: 1px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, var(--glossy-stroke)), rgba(255, 255, 255, 0));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
}
:where([data-dissolve="glossy-button"])::after { box-shadow: inset 0 0 var(--glossy-in-b) var(--glossy-in-s) rgba(255, 255, 255, var(--glossy-in-o)); opacity: var(--glossy-light, 1); }
:where(.dissolve-glossy-icon, .dissolve-glossy-label) { position: relative; }
:where(.dissolve-glossy-icon) { display: inline-flex; }
:where(.dissolve-glossy-icon:empty, .dissolve-glossy-label:empty) { display: none; }
:where(.dissolve-glossy-icon) svg { flex: none; }
`;

/** A glossy pill on el (a <button> is best: it brings focus and keyboard for free). */
export function createGlossyButton(host: HTMLElement, initial: GlossyButtonProps = {}): GlossyButtonInstance {
  injectStyle('dissolve-glossy-button', CSS);
  const props = propsOf(DEFAULTS, initial);
  const p = () => props.current;
  const sc = scope();
  const isButton = host instanceof HTMLButtonElement;

  host.dataset.dissolve = 'glossy-button';
  Object.assign(host.style, PILL);
  let full = false;
  if (isButton) host.type = 'button';
  else host.setAttribute('role', 'button');
  const icon = el('span', 'dissolve-glossy-icon');
  icon.setAttribute('aria-hidden', 'true');
  const slot = el('span');
  // The label prop lives in its own text node, so nodes put in the slot stay untouched.
  const text = document.createTextNode('');
  slot.append(text);
  host.append(icon, slot);

  const pressed = value(sc, 0, () => {
    const k = clamp(pressed.v, -0.2, 1.2);
    host.style.setProperty('--glossy-scale', (1 - (1 - PRESSED_SCALE) * (reducedMotion() ? 0 : k)).toFixed(4));
    host.style.setProperty('--glossy-light', (1 - (1 - PRESSED_LIGHT) * clamp(k)).toFixed(3));
  });
  const press = (to: number) => (reducedMotion() ? pressed.set(to) : pressed.spring(to, SPRING));

  function apply() {
    const o = p();
    const s = GLOSSY_SIZES[o.size] ?? GLOSSY_SIZES.md;
    const vars: Record<string, string | number> = {
      fill: o.color, label: o.labelColor, r: Math.min(o.radius, s.height / 2) + 'px',
      stroke: o.strokeOpacity, 'in-o': o.innerOpacity, 'in-b': o.innerBlur + 'px', 'in-s': o.innerSpread + 'px',
      'sh-o': o.shadowOpacity, 'sh-y': o.shadowY + 'px', 'sh-b': o.shadowBlur + 'px', ring: o.ringSpread + 'px',
      h: s.height + 'px', pad: s.padding + 'px', gap: s.gap + 'px', font: s.font + 'px',
    };
    for (const [k, v] of Object.entries(vars)) host.style.setProperty(`--glossy-${k}`, String(v));
    host.style.display = o.fullWidth ? 'flex' : 'inline-flex';
    if (o.fullWidth !== full) host.style.width = o.fullWidth ? '100%' : '';
    full = o.fullWidth;
    host.toggleAttribute('data-full', o.fullWidth);
    host.style.opacity = o.disabled ? '0.5' : '';
    host.style.cursor = o.disabled ? 'default' : 'pointer';
    if (isButton) (host as HTMLButtonElement).disabled = o.disabled;
    else host.setAttribute('aria-disabled', String(o.disabled));
    slot.className = 'dissolve-glossy-label' + (o.labelClassName ? ' ' + o.labelClassName : '');
    text.data = o.label ?? '';
    if (o.disabled) press(0);
  }

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 || p().disabled) return;
    if (p().haptics) vibrate(6);
    press(1);
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onUp);
  };
  const offWindow = () => {
    removeEventListener('pointerup', onUp);
    removeEventListener('pointercancel', onUp);
  };
  const onUp = () => {
    press(0);
    offWindow();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat && !p().disabled) press(1);
  };
  const onKeyUp = (e: KeyboardEvent) => { if (e.key === ' ' || e.key === 'Enter') press(0); };
  const onBlur = () => press(0);
  const onClick = () => { if (!p().disabled) p().onPress?.(); };
  host.addEventListener('pointerdown', onDown);
  host.addEventListener('keydown', onKeyDown);
  host.addEventListener('keyup', onKeyUp);
  host.addEventListener('blur', onBlur);
  host.addEventListener('click', onClick);

  apply();

  return {
    slot,
    icon,
    update(next) {
      if (props.update(next).size) apply();
    },
    destroy() {
      sc.dispose();
      offWindow();
      host.removeEventListener('pointerdown', onDown);
      host.removeEventListener('keydown', onKeyDown);
      host.removeEventListener('keyup', onKeyUp);
      host.removeEventListener('blur', onBlur);
      host.removeEventListener('click', onClick);
      icon.remove();
      slot.remove();
      for (const name of [...host.style]) if (name.startsWith('--glossy-')) host.style.removeProperty(name);
      for (const key of [...Object.keys(PILL), 'display', 'opacity', 'cursor', ...(full ? ['width'] : [])]) host.style.removeProperty(key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()));
      host.removeAttribute('data-full');
      if (!isButton) host.removeAttribute('role');
      delete host.dataset.dissolve;
    },
  };
}
