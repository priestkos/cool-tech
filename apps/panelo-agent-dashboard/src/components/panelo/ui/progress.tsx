'use client'

import * as React from 'react'
import { Progress as ProgressPrimitive, ProgressIndicator, ProgressLabel, ProgressTrack } from '@ui-sdk/react/progress'

import { cn } from '@/components/panelo/lib/utils'
import { type WithNodeChildren } from '@/components/panelo/lib/slot'

function Progress({ className, children, ...props }: WithNodeChildren<React.ComponentProps<typeof ProgressPrimitive>>) {
    return (
        <ProgressPrimitive className={cn('w-full', className)} {...props}>
            {children}
            <ProgressTrack className="bg-muted relative h-2 w-full overflow-hidden rounded-full">
                <ProgressIndicator className="bg-primary h-full transition-[width] data-indeterminate:w-full data-indeterminate:animate-pulse" />
            </ProgressTrack>
        </ProgressPrimitive>
    )
}

export { Progress, ProgressLabel }
