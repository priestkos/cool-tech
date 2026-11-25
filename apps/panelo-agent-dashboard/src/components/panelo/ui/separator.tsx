'use client'

import * as React from 'react'
import { Separator as SeparatorPrimitive } from '@ui-sdk/react/separator'

import { cn } from '@/components/panelo/lib/utils'

function Separator({ className, orientation = 'horizontal', decorative = true, ...props }: React.ComponentProps<typeof SeparatorPrimitive>) {
    return (
        <SeparatorPrimitive
            decorative={decorative}
            orientation={orientation}
            className={cn('bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px', className)}
            {...props}
        />
    )
}

export { Separator }
