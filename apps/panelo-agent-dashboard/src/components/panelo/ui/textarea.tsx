'use client'

import * as React from 'react'
import { Textarea as TextareaPrimitive } from '@ui-sdk/react/textarea'

import { cn } from '@/components/panelo/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<typeof TextareaPrimitive>) {
    return (
        <TextareaPrimitive
            className={cn(
                'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-lg border bg-transparent px-3 py-2 text-base outline-none transition-colors focus-visible:ring-3 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 aria-invalid:ring-3 dark:aria-invalid:border-destructive/50',
                className
            )}
            {...props}
        />
    )
}

export { Textarea }
