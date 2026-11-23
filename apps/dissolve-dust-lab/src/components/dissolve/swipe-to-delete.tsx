'use client';
/**
 * SwipeToDelete for React on the web, from dissolve (dissolve-ui). This file is yours. Same props
 * as the React Native version; the row itself lives in swipe-to-delete.core.ts.
 *
 * A row you swipe left to delete, like Mail or WhatsApp. Past the threshold (or with a quick
 * flick) the row dissolves, the list closes up behind it, then onDelete runs.
 *
 * <SwipeToDelete onDelete={() => remove(item.id)} rowClassName="rounded-2xl">
 *   <Row item={item} />
 * </SwipeToDelete>
 *
 * <SwipeToDelete onDelete={archive} preset="pixel" threshold={0.3} actionClassName="bg-amber-500">
 *   <MailRow mail={mail} />
 * </SwipeToDelete>
 */
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { createSwipeToDelete, type SwipeToDeleteProps as CoreProps } from './swipe-to-delete.core';
import { useDissolveCore } from './react';

export type SwipeToDeleteProps = CoreProps & {
  /** The row. It slides with the pointer over the delete action. */
  children: ReactNode;
  onDelete: () => void;
  /** Outer wrapper classes (margins, layout). This is the part that collapses. */
  className?: string;
  style?: CSSProperties;
};

export function SwipeToDelete({ children, className, style, ...props }: SwipeToDeleteProps) {
  const { host, instance } = useDissolveCore(createSwipeToDelete, props);
  return (
    <div ref={host} className={className} style={style}>
      {instance ? createPortal(children, instance.slot) : null}
    </div>
  );
}
