'use client'
// Client-only on purpose: imported by server layouts, a bare ui-sdk import there renders as undefined.

import * as React from 'react'
import { Button as ButtonPrimitive, type ButtonActionDetails } from '@ui-sdk/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/components/panelo/lib/utils'
import { slot } from '@/components/panelo/lib/slot'

const buttonVariants = cva('cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-transparent bg-clip-padding text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50 data-pending:cursor-progress [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0', {
    variants: {
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/80',
            destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
            outline: 'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
            ghost: 'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
            link: 'text-primary underline-offset-4 hover:underline',
        },
        size: {
            default: 'h-9 px-4 py-2',
            sm: 'h-8 rounded-[min(var(--radius-md),12px)] px-3 text-xs',
            lg: 'h-10 px-8',
            icon: 'h-9 w-9',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'default',
    },
})

// `onClick` keeps shadcn's HTMLButtonElement event so existing handlers type-check; ui-sdk adds `details` (who pressed it).
type ButtonProps = Omit<React.ComponentProps<typeof ButtonPrimitive>, 'onClick'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean
        onClick?: (event: React.MouseEvent<HTMLButtonElement>, details?: ButtonActionDetails) => unknown
    }

function Button({ className, variant, size, asChild, children, onClick, ...props }: ButtonProps) {
    return (
        <ButtonPrimitive
            className={cn(buttonVariants({ variant, size, className }))}
            onClick={onClick as React.ComponentProps<typeof ButtonPrimitive>['onClick']}
            {...props}
            {...slot(asChild, children)}
        />
    )
}

export { Button, buttonVariants, type ButtonProps }
