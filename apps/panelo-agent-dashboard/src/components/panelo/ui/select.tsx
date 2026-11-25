'use client'

import * as React from 'react'
import {
    SelectContent as SelectContentPrimitive,
    SelectGroupLabel,
    SelectItem as SelectItemPrimitive,
    SelectItemIcon,
    SelectItemIndicator,
    SelectSeparator as SelectSeparatorPrimitive,
    SelectTrigger as SelectTriggerPrimitive,
    SelectValue,
    SelectValueIcon,
} from '@ui-sdk/react/select'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/components/panelo/lib/utils'
import { type WithNodeChildren } from '@/components/panelo/lib/slot'

function SelectTrigger({ className, children, ...props }: WithNodeChildren<React.ComponentProps<typeof SelectTriggerPrimitive>>) {
    return (
        <SelectTriggerPrimitive
            className={cn(
                "border-input data-placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='text-'])]:text-muted-foreground flex h-9 w-full items-center justify-between rounded-lg border bg-transparent px-3 py-2 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&>span]:line-clamp-1 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
                className
            )}
            {...props}>
            {children}
            <ChevronsUpDown
                aria-hidden
                className="size-3 opacity-50"
            />
        </SelectTriggerPrimitive>
    )
}

// shadcn's `position="item-aligned"` is ui-sdk's `alignItemWithTrigger`.
function SelectContent({ className, position, ...props }: React.ComponentProps<typeof SelectContentPrimitive> & { position?: 'item-aligned' | 'popper' }) {
    return (
        <SelectContentPrimitive
            sideOffset={4}
            alignItemWithTrigger={position === 'item-aligned'}
            className={cn('bg-popover text-popover-foreground z-50 max-h-[min(24rem,var(--available-height))] min-w-[max(8rem,var(--anchor-width))] origin-(--transform-origin) overflow-y-auto rounded-lg p-1 shadow-md ring-1 ring-foreground/10 outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0', className)}
            {...props}
        />
    )
}

// Radix's SelectLabel heads a group; ui-sdk's SelectLabel names the trigger, so this maps to the group label.
function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectGroupLabel>) {
    return (
        <SelectGroupLabel
            className={cn('px-2 py-1.5 text-sm font-medium text-muted-foreground', className)}
            {...props}
        />
    )
}

function SelectItem({ className, children, ...props }: WithNodeChildren<React.ComponentProps<typeof SelectItemPrimitive>>) {
    return (
        <SelectItemPrimitive
            className={cn("data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground outline-hidden relative flex w-full cursor-default select-none items-center gap-2 rounded-md py-1.5 pl-2 pr-8 text-sm data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className)}
            {...props}>
            <SelectItemIndicator className="absolute right-2 flex size-3.5 items-center justify-center">
                <CheckIcon
                    className="size-3"
                    strokeWidth={3}
                />
            </SelectItemIndicator>
            {children}
        </SelectItemPrimitive>
    )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectSeparatorPrimitive>) {
    return (
        <SelectSeparatorPrimitive
            className={cn('bg-border pointer-events-none -mx-1 my-1 h-px', className)}
            {...props}
        />
    )
}

export { Select, SelectGroup } from '@ui-sdk/react/select'
export { SelectContent, SelectItem, SelectItemIcon, SelectLabel, SelectSeparator, SelectTrigger, SelectValue, SelectValueIcon }
