'use client'

import * as React from 'react'
import { Input as InputPrimitive } from '@ui-sdk/react/input'

import { cn } from '@/components/panelo/lib/utils'

// shadcn inputs take numbers for `type="number"`; ui-sdk's Input value is text.
function Input({ className, value, defaultValue, ...props }: Omit<React.ComponentProps<typeof InputPrimitive>, 'value' | 'defaultValue'> & { value?: string | number; defaultValue?: string | number }) {
    return (
        <InputPrimitive
            value={value === undefined ? undefined : String(value)}
            defaultValue={defaultValue === undefined ? undefined : String(defaultValue)}
            className={cn(
                'border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-lg border bg-transparent px-3 py-1 text-base outline-none transition-colors file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80',
                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3',
                'aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50',
                className
            )}
            {...props}
        />
    )
}

export { Input }
