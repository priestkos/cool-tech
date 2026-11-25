'use client'

import * as React from 'react'
import { Tooltip as TooltipPrimitive, TooltipContent as TooltipContentPrimitive, TooltipTrigger as TooltipTriggerPrimitive } from '@ui-sdk/react/tooltip'

import { cn } from '@/components/panelo/lib/utils'
import { slot } from '@/components/panelo/lib/slot'

// ui-sdk needs no provider; this only carries shadcn's `delayDuration` default down to each tooltip.
const DelayContext = React.createContext(0)

function TooltipProvider({ delayDuration = 0, children }: { delayDuration?: number; children?: React.ReactNode }) {
    return <DelayContext.Provider value={delayDuration}>{children}</DelayContext.Provider>
}

function Tooltip({ delayDuration, ...props }: React.ComponentProps<typeof TooltipPrimitive> & { delayDuration?: number }) {
    const delay = React.useContext(DelayContext)
    return (
        <TooltipPrimitive
            delay={delayDuration ?? delay}
            {...props}
        />
    )
}

function TooltipTrigger({ asChild, children, ...props }: React.ComponentProps<typeof TooltipTriggerPrimitive> & { asChild?: boolean }) {
    return (
        <TooltipTriggerPrimitive
            {...props}
            {...slot(asChild, children)}
        />
    )
}

function TooltipContent({ className, sideOffset = 4, hidden, ...props }: React.ComponentProps<typeof TooltipContentPrimitive> & { hidden?: boolean }) {
    // shadcn's sidebar passes `hidden` to suppress the tooltip; ui-sdk owns `hidden`, so drop the content instead.
    if (hidden) return null
    return (
        <TooltipContentPrimitive
            sideOffset={sideOffset}
            className={cn(
                'bg-foreground text-background rounded-md z-50 max-w-sm px-3 py-2 text-xs transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
                className
            )}
            {...props}
        />
    )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
