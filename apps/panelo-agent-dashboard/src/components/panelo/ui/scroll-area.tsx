'use client'

import * as React from 'react'
import { ScrollArea as ScrollAreaPrimitive, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from '@ui-sdk/react/scroll-area'

import { cn } from '@/components/panelo/lib/utils'

const fadeMask = '[mask-image:linear-gradient(to_bottom,black,transparent)]'

/**
 * `fade` turns on the top-edge scroll fade (AGENTS.md: progressive blur + surface fade): pass the
 * enclosing surface as a gradient start, like `from-card`. Each layer ramps 0→1 over the first 24px of
 * scroll; opacity sits on the layers, never the overlay, so the backdrop blur keeps working. Under a
 * sticky header, set `--scroll-fade-top` on the root to its height so the fade starts below it.
 * `horizontal` adds the inline-axis scrollbar, letting wide content (a table) scroll sideways.
 */
function ScrollArea({
    className,
    contentClassName,
    children,
    type = 'hover',
    fade,
    horizontal,
    ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive> & { fade?: string; horizontal?: boolean; contentClassName?: string }) {
    const overlay = React.useRef<HTMLDivElement>(null)
    const onScroll = fade
        ? (event: React.UIEvent<HTMLDivElement>) => overlay.current?.style.setProperty('--fade', String(Math.min(event.currentTarget.scrollTop / 24, 1)))
        : undefined

    return (
        <ScrollAreaPrimitive
            type={type}
            className={cn('relative', className)}
            {...props}>
            <ScrollAreaViewport
                onScroll={onScroll}
                className="focus-visible:ring-ring/50 size-full rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring-[3px]">
                <ScrollAreaContent className={contentClassName}>{children}</ScrollAreaContent>
            </ScrollAreaViewport>
            {fade ? (
                <div ref={overlay} aria-hidden className="pointer-events-none absolute inset-x-0 top-[var(--scroll-fade-top,0px)] z-10 h-6 [--fade:0]">
                    <div className={cn('absolute inset-x-0 top-0 h-6 opacity-(--fade) backdrop-blur-[1px]', fadeMask)} />
                    <div className={cn('absolute inset-x-0 top-0 h-4 opacity-(--fade) backdrop-blur-[4px]', fadeMask)} />
                    <div className={cn('absolute inset-0 bg-linear-to-b to-transparent opacity-(--fade)', fade)} />
                </div>
            ) : null}
            <ScrollBar />
            {horizontal ? <ScrollBar orientation="horizontal" /> : null}
        </ScrollAreaPrimitive>
    )
}

function ScrollBar({ className, orientation = 'vertical', ...props }: React.ComponentProps<typeof ScrollAreaScrollbar>) {
    return (
        <ScrollAreaScrollbar
            orientation={orientation}
            className={cn(
                'flex touch-none select-none p-px opacity-0 transition-opacity data-visible:opacity-100',
                orientation === 'vertical' && 'w-2.5 border-l border-l-transparent',
                orientation === 'horizontal' && 'h-1.5 flex-col border-t border-t-transparent',
                className
            )}
            {...props}>
            <ScrollAreaThumb className="bg-border rounded-full" />
        </ScrollAreaScrollbar>
    )
}

export { ScrollArea, ScrollBar }
