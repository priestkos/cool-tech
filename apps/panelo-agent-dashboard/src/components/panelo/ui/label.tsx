'use client'

import * as React from 'react'
import { Label as LabelPrimitive } from '@ui-sdk/react/label'

import { cn } from '@/components/panelo/lib/utils'

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive>) {
    return (
        <LabelPrimitive
            className={cn('block select-none text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50', className)}
            {...props}
        />
    )
}

export { Label }
