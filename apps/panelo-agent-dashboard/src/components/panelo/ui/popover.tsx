'use client'

import * as React from 'react'
import { PopoverContent as PopoverContentPrimitive, PopoverTrigger as PopoverTriggerPrimitive } from '@ui-sdk/react/popover'

import { cn } from '@/components/panelo/lib/utils'
import { slot } from '@/components/panelo/lib/slot'

function PopoverTrigger({ asChild, children, ...props }: React.ComponentProps<typeof PopoverTriggerPrimitive> & { asChild?: boolean }) {
    return (
        <PopoverTriggerPrimitive
            {...props}
            {...slot(asChild, children)}
        />
    )
}

function PopoverContent({ className, align = 'center', sideOffset = 4, ...props }: React.ComponentProps<typeof PopoverContentPrimitive>) {
    return (
        <PopoverContentPrimitive
            align={align}
            sideOffset={sideOffset}
            className={cn('bg-popover text-popover-foreground z-50 w-72 origin-(--transform-origin) rounded-lg p-4 shadow-md ring-1 ring-foreground/10 outline-hidden transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0', className)}
            {...props}
        />
    )
}

export { Popover } from '@ui-sdk/react/popover'
export { PopoverTrigger, PopoverContent }
