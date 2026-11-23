'use client';
/**
 * ScratchCard for React on the web, from dissolve (dissolve-ui). This file is yours. Same props as
 * the React Native version; the card itself lives in scratch-card.core.ts.
 *
 * A lottery style card with a glossy metal foil over your content. The card tilts in 3D under the
 * pointer and the light moves with it. Scratching erases the foil along a ragged stroke and sheds
 * it as grains; past `threshold` the rest of the foil turns to dust and onReveal fires.
 *
 * <ScratchCard onReveal={claim}>
 *   <strong className="text-[40px]">$25</strong>
 * </ScratchCard>
 *
 * const card = useRef<ScratchCardHandle>(null);
 * <ScratchCard ref={card} color="#D9B26F" label="Scratch for your code" brush={44} threshold={0.6}>
 *   <PromoCode code="SPRING25" />
 * </ScratchCard>
 * card.current?.reset();
 */
import { useImperativeHandle, type CSSProperties, type ReactNode, type Ref } from 'react';
import { createPortal } from 'react-dom';
import { createScratchCard, type ScratchCardHandle, type ScratchCardProps as CoreProps } from './scratch-card.core';
import { useDissolveCore } from './react';

export type { ScratchCardHandle };

export type ScratchCardProps = CoreProps & {
  /** What the foil hides: a reward, a promo code, any node. Centered on the card. */
  children?: ReactNode;
  /** Styles of the outer box (margins, position...). Its size comes from width and height. */
  style?: CSSProperties;
  ref?: Ref<ScratchCardHandle>;
};

export function ScratchCard({ children, style, ref, ...props }: ScratchCardProps) {
  const { host, instance, current } = useDissolveCore(createScratchCard, props);
  useImperativeHandle(ref, () => ({
    reset: () => current.current?.reset(),
    reveal: async () => current.current?.reveal(),
    progress: () => current.current?.progress() ?? 0,
  }), [current]);
  return <div ref={host} style={style}>{instance ? createPortal(children, instance.slot) : null}</div>;
}
