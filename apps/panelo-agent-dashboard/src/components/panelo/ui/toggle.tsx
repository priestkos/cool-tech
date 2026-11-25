'use client'

import * as React from 'react'
import { Toggle as TogglePrimitive } from '@ui-sdk/react/toggle'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/components/panelo/lib/utils'

const toggleVariants = cva(
    "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 data-pressed:bg-muted data-pressed:text-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-all aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
    {
        variants: {
            variant: {
                default: 'bg-transparent',
                outline: 'border border-input bg-transparent hover:bg-muted',
            },
            size: {
                default: 'h-9 px-2 min-w-9',
                sm: 'h-8 px-1.5 min-w-8',
                lg: 'h-10 px-2.5 min-w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

function Toggle({ className, variant, size, ...props }: React.ComponentProps<typeof TogglePrimitive> & VariantProps<typeof toggleVariants>) {
    return (
        <TogglePrimitive
            className={cn(toggleVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Toggle, toggleVariants }
