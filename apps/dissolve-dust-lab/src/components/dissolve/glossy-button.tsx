'use client';
/**
 * GlossyButton for React on the web, from dissolve (dissolve-ui). This file is yours. Same props as
 * the React Native version; the button itself lives in glossy-button.core.ts.
 *
 * <GlossyButton onPress={start}>Get started</GlossyButton>
 *
 * <GlossyButton icon={({ color, size }) => <PlusIcon color={color} size={size} />} onPress={create}>
 *   New project
 * </GlossyButton>
 *
 * <GlossyButton color="#E5484D" radius={14} size="lg" onPress={remove}>Delete</GlossyButton>
 * <GlossyButton fullWidth onPress={next}>Continue</GlossyButton>
 */
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { createGlossyButton, GLOSSY_SIZES, type GlossyButtonProps as CoreProps, type GlossyButtonSize } from './glossy-button.core';
import { useDissolveCore } from './react';

export type { GlossyButtonSize };

export type GlossyButtonProps = CoreProps & {
  /** The label. A string, or any node. */
  children?: ReactNode;
  /** Leading icon. A node, or a function that gets the label color and the icon size. */
  icon?: ReactNode | ((p: { color: string; size: number }) => ReactNode);
  /** Outer classes (margins, alignment, width...). */
  className?: string;
  style?: CSSProperties;
};

export function GlossyButton({ children, icon, className, style, ...props }: GlossyButtonProps) {
  const { host, instance } = useDissolveCore(createGlossyButton, { ...props, label: children == null ? props.label : undefined });
  const glyph = typeof icon === 'function' ? icon({ color: props.labelColor ?? '#FFFFFF', size: GLOSSY_SIZES[props.size ?? 'md'].icon }) : icon;
  return (
    <button ref={host} className={className} style={style}>
      {instance ? createPortal(glyph, instance.icon) : null}
      {instance ? createPortal(children, instance.slot) : null}
    </button>
  );
}
