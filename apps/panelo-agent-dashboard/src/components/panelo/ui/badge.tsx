import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/components/panelo/lib/utils'

const badgeVariants = cva('inline-flex items-center justify-center rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-all overflow-hidden', {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground [a&]:hover:bg-primary/80',
            secondary: 'bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/80',
            destructive: 'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/20',
            outline: 'border-border text-foreground [a&]:hover:bg-muted [a&]:hover:text-muted-foreground',
            // Tonal pills (tokens in globals.css): a tint, a one-step-darker border and a deep ink of one hue.
            violet: 'border-tone-violet-border bg-tone-violet-bg text-tone-violet-fg',
            green: 'border-tone-green-border bg-tone-green-bg text-tone-green-fg',
            blue: 'border-tone-blue-border bg-tone-blue-bg text-tone-blue-fg',
            cyan: 'border-tone-cyan-border bg-tone-cyan-bg text-tone-cyan-fg',
            orange: 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-fg',
            yellow: 'border-tone-yellow-border bg-tone-yellow-bg text-tone-yellow-fg',
        },
    },
    defaultVariants: {
        variant: 'default',
    },
})

function Badge({ className, variant, asChild = false, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : 'span'
    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    )
}

export { Badge, badgeVariants }
